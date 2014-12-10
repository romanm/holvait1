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

//@Component("scheduledTasks")
@EnableScheduling
public class ScheduledTasksWeb {
	private static final Logger logger = LoggerFactory.getLogger(ScheduledTasksWeb.class);
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
			logger.debug(dateFormat.format(new Date())+" - updateDrugsDbFromClinicFiles == "+drugFromClinic.get("DRUG_ID")+"/"+drugFromClinic.get("DRUG_NAME"));
			Map<String, Object> readDrugFromName = lp24jdbc.readDrugFromName((String) drugFromClinic.get("DRUG_NAME"));
			final Long savedTsInClinic = (Long) drugFromClinic.get("savedTS");
			if(null == readDrugFromName){
				final Map<String, Object> insertDrug = lp24jdbc.insertDrug(drugFromClinic, new Timestamp(savedTsInClinic));
				final Integer drugId = (Integer) insertDrug.get("DRUG_ID");
				drugFromClinic.put("DRUG_ID", drugId);
				lp24Controller.writeToJsonDbFile(drugFromClinic, Lp24Config.getDrugDbJsonName(drugId));
				isChanged = true;
			}else{
				final Integer drugId = (Integer) readDrugFromName.get("DRUG_ID");
				final Map<String, Object> readDrug = lp24Controller.readDrug(drugId);
				lp24Controller.margeDrugs(drugFromClinic, readDrug);
				logger.debug(dateFormat.format(new Date())+" - updateDrugsDbFromClinicFiles == "+readDrug.get("isChanged"));
				if((boolean) readDrug.get("isChanged")){
					Timestamp savedTS = (Timestamp) readDrugFromName.get("DRUG_SAVEDTS");
					Timestamp savedTS2 =  new Timestamp(savedTsInClinic >= savedTS.getTime() ? savedTsInClinic : new Date().getTime());
					lp24jdbc.updateDrugSavedTS(drugId, savedTS2);
					readDrug.put("savedTS", savedTS2);
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
