package org.cuwyhol3;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component("scheduledTasks")
@EnableScheduling
public class ScheduledTasksWeb {
	private static final Logger logger = LoggerFactory.getLogger(ScheduledTasksClinic.class);
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm:ss.SSS");

	@Autowired private Lp24jdbc lp24jdbc;
	@Autowired private Lp24ControllerImpl lp24Controller;
	
	final static int maxSaveInOneTimes = 10;
	
	@Scheduled(fixedRate = 17001)
	public void updateDrugsDbFromClinicFiles(){
		final String workDirForPushDrugsFromClinic = Lp24Config.jsonDbPhad+Lp24Config.subDirForPushDrugsFromClinic;
		File folderWithPushedDrugsFromClinic = new File(workDirForPushDrugsFromClinic);
		File[] listOfFilesFromClinic = folderWithPushedDrugsFromClinic.listFiles();
		final int saveOneTimes = Math.min(maxSaveInOneTimes, listOfFilesFromClinic.length);
		if(saveOneTimes == 0)
			return;
		logger.debug(dateFormat.format(new Date())+" - updateDrugsDbFromClinicFiles == "+folderWithPushedDrugsFromClinic);
		logger.debug(dateFormat.format(new Date())+" - updateDrugsDbFromClinicFiles == "+saveOneTimes+" from "+listOfFilesFromClinic.length);
		boolean isChanged = false;
		for (int i = 0; i < saveOneTimes; i++) {
			final File fileFromClinic = listOfFilesFromClinic[i];
			Map<String, Object> drugFromClinic = lp24Controller.readJsonDbFile2map(fileFromClinic);
			final Long lNewDrugSavedTs = (Long) drugFromClinic.get("savedTs");
			//not for update from other DB / locale DB only
			//lp24Controller.updateDrugs(newDrug);
			Map<String, Object> readDrugFromName = lp24jdbc.readDrugFromName((String) drugFromClinic.get("DRUG_NAME"));
			if(null == readDrugFromName){
				final Map<String, Object> newDrug = lp24jdbc.newDrug(drugFromClinic, new Timestamp(lNewDrugSavedTs));
				final Integer drugId = (Integer) newDrug.get("DRUG_ID");
				drugFromClinic.put("DRUG_ID", drugId);
				lp24Controller.writeToJsonDbFile(drugFromClinic, Lp24Config.getDrugDbJsonName(drugId));
				isChanged = true;
			}else{
				final Integer drugId = (Integer) readDrugFromName.get("DRUG_ID");
				final Map<String, Object> readDrug = lp24Controller.readDrug(drugId);
				//isChanged = lp24Controller.addDose2DrugDocument(drugFromClinic, readDrug);
				//if(isChanged){
				lp24Controller.margeDrugs(drugFromClinic, readDrug);
				if((boolean) readDrug.get("isChanged")){
					Timestamp savedTs = (Timestamp) readDrugFromName.get("DRUG_SAVEDTS");
					savedTs = new Timestamp((null != lNewDrugSavedTs && lNewDrugSavedTs > savedTs.getTime())?lNewDrugSavedTs:new Date().getTime());
					readDrug.put("savedTs", savedTs);
					lp24jdbc.updateDrugSavedTs(drugId, savedTs);
					lp24Controller.writeToJsonDbFile(readDrug, Lp24Config.getDrugDbJsonName(drugId));
				}
			}
			try {
				Files.delete(fileFromClinic.toPath());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		if(isChanged){
			List<Map<String, Object>> drug1sList = lp24Controller.drug1sList();
		}
	}

}
