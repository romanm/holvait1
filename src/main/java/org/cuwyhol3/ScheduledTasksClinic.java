package org.cuwyhol3;

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
public class ScheduledTasksClinic {
	private static final Logger logger = LoggerFactory.getLogger(ScheduledTasksClinic.class);
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm:ss");
	
	@Autowired private Lp24jdbc lp24jdbc;
	@Autowired private Lp24ControllerImpl lp24Controller;

	@Scheduled(fixedRate = 1001)
	public void reReadDrugFromWeb(){
		final Integer countDrugFromWebTable = lp24jdbc.countDrugFromWebTable();
		logger.debug(dateFormat.format(new Date())+" - check1DrugFromWeb - "+countDrugFromWebTable);
		if(true && countDrugFromWebTable > 0){
			logger.debug(dateFormat.format(new Date())+" - check1DrugFromWeb - "+countDrugFromWebTable);
			final Map<String, Object> drugToCheck = lp24jdbc.getDrugForWebToCheck();
			Integer drugId  = (Integer) drugToCheck.get("DRUG_ID");
			Integer drugWebId  = (Integer) drugToCheck.get("DRUG_WEB_ID");
			final Map<String, Object> readDrugFromWeb = lp24Controller.readDrugFromWeb("sah",drugWebId);
			final Map<String, Object> readDrug = lp24Controller.readDrug(drugId);
			lp24Controller.margeDrugs(readDrugFromWeb, readDrug);
			Timestamp savedTsInWeb = (Timestamp) drugToCheck.get("DRUG_WEB_SAVEDTS");
			Timestamp savedTS = (Timestamp) drugToCheck.get("DRUG_SAVEDTS");
//			if(savedTsInWeb.getTime() > savedTS.getTime()){ так правильніше, але дає зациклювання
			if(savedTsInWeb.getTime() != savedTS.getTime()){ // случай з реальної ситуації
				savedTS = savedTsInWeb;
			}else if((boolean) readDrug.get("isChanged")){
				savedTS = new Timestamp(new Date().getTime());
			}
			lp24jdbc.updateDrugSavedTS(drugId, savedTS);
			if((boolean) readDrug.get("isChanged")){
				readDrug.put("savedTS", savedTS);
				lp24Controller.writeToJsonDbFile(readDrug, Lp24Config.getDrugDbJsonName(drugId));
				lp24Controller.pushWebNewDrug("sah", readDrug);
			}
			lp24jdbc.delete1DrugWeb(drugWebId);
			logger.debug(dateFormat.format(new Date())+" - check1DrugFromWeb - END"+readDrug);
			return;
		}
		final List<Map<String, Object>> readDrugListeFromWeb = lp24Controller.readDrugListeFromWeb("sah");
		logger.debug(dateFormat.format(new Date())+" - check1DrugFromWeb - "+readDrugListeFromWeb);
		logger.debug(dateFormat.format(new Date())+" - check1DrugFromWeb - "+readDrugListeFromWeb.size());
		lp24jdbc.insertDrugFromWebToUpdateCheck(readDrugListeFromWeb);
		logger.debug(dateFormat.format(new Date())+" - check1DrugFromWeb - "+readDrugListeFromWeb.size());
		lp24Controller.pushNewDrugsToWebServer("sah");
		lp24jdbc.deleteChekedDrugFromWeb();
		
	}

	@Scheduled(fixedRate = 1007001)
	public void checkSavedPatient(){
		final Map<String, Object> readSavedPatient = lp24jdbc.readSavedPatient();
		logger.debug(dateFormat.format(new Date())+" - read the newly saved not processed patient == "+readSavedPatient);
		if(null == readSavedPatient)
			return;
		int patientId = (int) readSavedPatient.get("patient_id");
		Map<String, Object> readJsonDbFile2map = lp24Controller.readJsonDbFile2map(Lp24Config.getPatientDbJsonName(patientId));
		boolean updateDrugToBlock1 = false;
		for (Map map : (List<Map>) readJsonDbFile2map.get("prescribesHistory")) {
			for (Map drugInPatientDocument : (List<Map>) (List) ((Map) map.get("prescribes")).get("tasks")) {
				logger.debug("\n"+drugInPatientDocument);
				if(null == drugInPatientDocument)
					continue;
				final Integer drugId = (Integer) drugInPatientDocument.get("DRUG_ID");
				if(null == drugId)
					continue;
				Map<String, Object> readDrugDocument = lp24Controller.readDrug(drugId);
				updateDrugToBlock1 = updateDrugToBlock1 || lp24Controller.updateDrugToBlock1(readDrugDocument, drugInPatientDocument);
				if(updateDrugToBlock1){
					lp24Controller.writeToJsonDbFile(readDrugDocument, Lp24Config.getDrugDbJsonName(drugId));
				}
			}
		}
		lp24jdbc.updateSavedPatientIsChecked(patientId);
	}

	@Scheduled(fixedRate = 887000)
	public void reportCurrentTime() {
		System.out.println("The time is now " + dateFormat.format(new Date()));
	}
}
