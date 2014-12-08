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
public class ScheduledTasks {
	private static final Logger logger = LoggerFactory.getLogger(ScheduledTasks.class);
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm:ss");
	
	@Autowired private Lp24jdbc lp24jdbc;
	@Autowired private Lp24ControllerImpl lp24Controller;

//	@Scheduled(fixedRate = 1000)
	public void reReadDrugFromWeb(){
		final Integer countDrugFromWebTable = lp24jdbc.countDrugFromWebTable();
		if(countDrugFromWebTable > 0){
			final Map<String, Object> drugToCheck = lp24jdbc.getDrugForWebToCheck();
			logger.debug(dateFormat.format(new Date())+" - reReadDrugFromWeb - "+drugToCheck);
			Integer drugId  = (Integer) drugToCheck.get("DRUG_ID");
			Integer drugWebId  = (Integer) drugToCheck.get("DRUG_WEB_ID");
			Map<String, Object> drugTasks = check1DrugWithDrugFromWeb(drugWebId,drugId);
			Timestamp drugWebsavedTS = (Timestamp) drugToCheck.get("DRUG_WEB_SAVEDTS");
			final long ldrugWebsavedTS = drugWebsavedTS.getTime();
			lp24jdbc.updateDrugCheckedWebSavedTs(drugId, drugWebsavedTS);
			if((boolean) drugTasks.get("isChanged")){
				Timestamp savedTS = (Timestamp) drugToCheck.get("DRUG_SAVEDTS");
				savedTS = new Timestamp((ldrugWebsavedTS > savedTS.getTime())?ldrugWebsavedTS:new Date().getTime());
				lp24jdbc.updateDrugSavedTs(drugId, savedTS);
				lp24Controller.writeToJsonDbFile(drugTasks, Lp24Config.getDrugDbJsonName(drugId));
				drugTasks.put("savedTs", savedTS);
				lp24Controller.pushWebNewDrug("sah", drugTasks);
			}
			lp24jdbc.delete1DrugWeb(drugWebId);
			return;
		}
		final List<Map<String, Object>> readDrugListeFromWeb = lp24Controller.readDrugListeFromWeb("sah");
		logger.debug(dateFormat.format(new Date())+" - reReadDrugFromWeb - "+readDrugListeFromWeb.size());
		lp24jdbc.insertDrugFromWebToUpdateCheck(readDrugListeFromWeb);
		lp24Controller.pushNewDrugsToWebServer("sah");
	}

	private Map<String, Object> check1DrugWithDrugFromWeb(Integer drugWebId, Integer drugId) {
		final Map<String, Object> readDrugFromWeb = lp24Controller.readDrugFromWeb("sah",drugWebId);
		final Map<String, Object> readDrug = lp24Controller.readDrug(drugId);
		logger.debug(" w "+readDrugFromWeb);
		readDrug.put("isChanged", false);
		final boolean addDose2DrugDocument = lp24Controller.addDose2DrugDocument(readDrugFromWeb, readDrug);
		readDrug.put("isChanged", addDose2DrugDocument);
		final List webTasks = getPrescribesTasks(readDrugFromWeb);
		List drugTasks = getPrescribesTasks(readDrug);
		if(webTasks != null){
			if(drugTasks == null)
			{
				readDrug.put("prescribesHistory", readDrugFromWeb.get("prescribesHistory"));
				readDrug.put("isChanged", true);
			}else
			{
				final int hashCode = drugTasks.hashCode();

				drugTasks = lp24Controller.addListUnique(webTasks, drugTasks);
				if(drugTasks.size() > 5){
					final Map prescribesHistoryPrescribes = getPrescribesHistoryPrescribes(readDrug);
					lp24Controller.collectingStatistic("tasks",drugTasks,prescribesHistoryPrescribes);
					prescribesHistoryPrescribes.put("tasks", drugTasks.subList(0, 5));
				}
				logger.debug(" w "+hashCode+" != " + drugTasks.hashCode()+"/"+(hashCode != drugTasks.hashCode()));
				if(hashCode != drugTasks.hashCode())
					readDrug.put("isChanged", true);
			}
		}
		else if(drugTasks != null)
		{
			readDrug.put("isChanged", true);
		}
		return readDrug;
	}

	private Map getPrescribesHistoryPrescribes(final Map<String, Object> prescribesHistoryParent) {
		Map map = null;
		final List<Map> prescribesHistory = (List) prescribesHistoryParent.get("prescribesHistory");
		if(prescribesHistory != null) {
			map = (Map) prescribesHistory.get(0).get("prescribes");
		}
		return map;
	}
	private List getPrescribesTasks(final Map<String, Object> prescribesHistoryParent) {
		List tasks = null;
		final List<Map> prescribesHistory = (List) prescribesHistoryParent.get("prescribesHistory");
		if(prescribesHistory != null) {
			final Map map = (Map) prescribesHistory.get(0).get("prescribes");
			tasks = (List) map.get("tasks");
		}
		return tasks;
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
		System.out.println("The time is now " + dateFormat.format(new Date()));
	}
}