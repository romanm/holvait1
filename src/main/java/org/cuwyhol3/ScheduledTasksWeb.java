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
	private static final Logger logger = LoggerFactory.getLogger(ScheduledTasks.class);
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm:ss");

	@Autowired private Lp24jdbc lp24jdbc;
	@Autowired private Lp24ControllerImpl lp24Controller;
	
	final static int maxSaveInOneTimes = 10;
	
	@Scheduled(fixedRate = 17000)
	public void addNewPushedDrugs(){
		final String workDir = Lp24Config.jsonDbPhad+Lp24Config.pushedWebNewDrug;
		File folder = new File(workDir);
		File[] listOfFiles = folder.listFiles();
		final int saveOneTimes = Math.min(maxSaveInOneTimes, listOfFiles.length);
		if(saveOneTimes == 0)
			return;
		logger.debug(dateFormat.format(new Date())+" - addNewPushedDrugs == "+saveOneTimes+" from "+listOfFiles.length);
		for (int i = 0; i < saveOneTimes; i++) {
			final File file = listOfFiles[i];
			Map<String, Object> newDrug = lp24Controller.readJsonDbFile2map(file);
			final Long lNewDrugSavedTs = (Long) newDrug.get("savedTs");
			//not for update from other DB / locale DB only
			//lp24Controller.updateDrugs(newDrug);
			final Map<String, Object> readDrugFromName = lp24jdbc.readDrugFromName((String) newDrug.get("DRUG_NAME"));
			if(null == readDrugFromName){
				newDrug = lp24jdbc.newDrug(newDrug, new Timestamp(lNewDrugSavedTs));
				lp24Controller.writeToJsonDbFile(newDrug, Lp24Config.getDrugDbJsonName((Integer) newDrug.get("DRUG_ID")));
			}else{
				final boolean addDose2DrugDocument = lp24Controller.addDose2DrugDocument(newDrug, readDrugFromName);
				if(addDose2DrugDocument){
					final Integer drugId = (Integer) readDrugFromName.get("DRUG_ID");
					Timestamp savedTS = (Timestamp) readDrugFromName.get("DRUG_SAVEDTS");
					savedTS = new Timestamp((lNewDrugSavedTs > savedTS.getTime())?lNewDrugSavedTs:new Date().getTime());
					lp24jdbc.updateDrugSavedTs(drugId, savedTS);
				}
			}
			try {
				Files.delete(file.toPath());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		if(saveOneTimes > 0){
			List<Map<String, Object>> drug1sList = lp24Controller.drug1sList();
		}
	}

}
