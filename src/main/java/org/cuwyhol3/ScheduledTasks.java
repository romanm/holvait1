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
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

	@Autowired
	private Lp24jdbc lp24jdbc;

	@Autowired
	private Lp24ControllerImpl lp24Controller;

	@Scheduled(fixedRate = 117000)
	public void checkSavedPatient() {
		final Map<String, Object> readSavedPatient = lp24jdbc.readSavedPatient();
		logger.debug(""+readSavedPatient+" "+dateFormat.format(new Date()));
		if(null == readSavedPatient)
			return;
		int patientId = (int) readSavedPatient.get("patient_id");
		Map<String, Object> readJsonDbFile2map = lp24Controller.readJsonDbFile2map(Lp24Config.getPatientDbJsonName(patientId));
		for (Map map : (List<Map>) readJsonDbFile2map.get("prescribesHistory")) {
			for (Map drugInPatientDocument : (List<Map>) (List) ((Map) map.get("prescribes")).get("tasks")) {
				logger.debug(""+drugInPatientDocument);
				if(null == drugInPatientDocument)
					continue;
				final Integer drugId = (Integer) drugInPatientDocument.get("DRUG_ID");
				if(null == drugId)
					continue;
				final Map<String, Object> readDrugDocument = lp24Controller.readDrug(drugId);
				logger.debug(""+readDrugDocument);
				if(lp24Controller.updateDrugToBlock1(readDrugDocument, drugInPatientDocument)){
					lp24Controller.writeToJsonDbFile(readDrugDocument, Lp24Config.getDrugDbJsonName(drugId));
				}
			}
		}
		lp24jdbc.updateSavedPatientIsChecked(patientId);
	}

	@Scheduled(fixedRate = 287000)
	public void reportCurrentTime() {
		System.out.println("The time is now " + dateFormat.format(new Date()) + lp24jdbc);
	}
}