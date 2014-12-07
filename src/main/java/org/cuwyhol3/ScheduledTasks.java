package org.cuwyhol3;

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
public class ScheduledTasks {
	private static final Logger logger = LoggerFactory.getLogger(ScheduledTasks.class);
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm:ss");
	
	@Autowired private Lp24jdbc lp24jdbc;
	@Autowired private Lp24ControllerImpl lp24Controller;

	@Scheduled(fixedRate = 17000)
	public void reReadDrugWeb(){
		final Integer countDrugWeb = lp24jdbc.countDrugWeb();
		if(countDrugWeb > 0)
			return;
		final List<Map<String, Object>> readDrugWeb = lp24Controller.readDrugWeb("sah");
		logger.debug(dateFormat.format(new Date())+" - reReadDrugWeb - "+readDrugWeb.size());
		lp24jdbc.insertDrugWeb(readDrugWeb);
		lp24Controller.pushNewDrugInWeb("sah");
	}

	@Scheduled(fixedRate = 107000)
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
		System.out.println("The time is now " + dateFormat.format(new Date()) + lp24jdbc);
	}
}