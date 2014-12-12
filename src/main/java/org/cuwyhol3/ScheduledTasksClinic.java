package org.cuwyhol3;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Calendar;
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
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm:ss.SSS");

	@Autowired private Lp24jdbc lp24jdbc;
	@Autowired private Lp24ControllerImpl lp24Controller;
	private static Calendar waitToDate;
	private static int multipleWaitSecondReReadDrugFromWeb;

	ScheduledTasksClinic(){
		initWaitToDate();
	}

	@Scheduled(fixedRate = 2001)
	public void reReadDrugFromWeb(){
		if(Calendar.getInstance().getTimeInMillis() < waitToDate.getTimeInMillis())
			return;
		final Integer countDrugFromWebTable = lp24jdbc.countDrugFromWebTable();
		if(0 == countDrugFromWebTable){
			final List<Map<String, Object>> readDrugListeFromWeb = lp24Controller.readDrugListeFromWeb("sah");
			logger.debug(dateFormat.format(new Date())+" - reReadDrugFromWeb - "+readDrugListeFromWeb.size());
			lp24jdbc.insertDrugFromWebToUpdateCheck(readDrugListeFromWeb);
			lp24Controller.pushNewDrugsToWebServer("sah");
			lp24jdbc.deleteNoCheckableDrugFromWeb();
			final Integer countDrugFromWebTable2 = lp24jdbc.countDrugFromWebTable();
			logger.debug(dateFormat.format(new Date())+" - reReadDrugFromWeb - "+countDrugFromWebTable2);
			if(0 == countDrugFromWebTable2){
				multipleWaitToDate();
				logger.debug(dateFormat.format(new Date())+" - check1DrugFromWeb - "+multipleWaitSecondReReadDrugFromWeb+" * 2001");
				printDifference(Calendar.getInstance().getTime(), waitToDate.getTime());
			}
		}else{
			initWaitToDate();
			logger.debug(dateFormat.format(new Date())+" - check1DrugFromWeb - "+countDrugFromWebTable);
			final Map<String, Object> drugToCheck = lp24jdbc.getDrugForWebToCheck();
			if(null == drugToCheck)
			{
				lp24jdbc.deleteNoCheckableDrugFromWeb();
				return;
			}
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
	}

	private void multipleWaitToDate() {
		if(multipleWaitSecondReReadDrugFromWeb < 2048)
			multipleWaitSecondReReadDrugFromWeb *= 2;
		waitToDate = Calendar.getInstance();
		final int addSec = 2001 * multipleWaitSecondReReadDrugFromWeb;
		waitToDate.add(Calendar.MILLISECOND, addSec);
	}
	private void initWaitToDate() {
		this.multipleWaitSecondReReadDrugFromWeb = 2;
		waitToDate = Calendar.getInstance();
	}

	@Scheduled(fixedRate = 17001)
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


	public void printDifference(Date startDate, Date endDate){

		//milliseconds
		long different = endDate.getTime() - startDate.getTime();

		long secondsInMilli = 1000;
		long minutesInMilli = secondsInMilli * 60;
		long hoursInMilli = minutesInMilli * 60;
		long daysInMilli = hoursInMilli * 24;

		long elapsedDays = different / daysInMilli;
		different = different % daysInMilli;

		long elapsedHours = different / hoursInMilli;
		different = different % hoursInMilli;

		long elapsedMinutes = different / minutesInMilli;
		different = different % minutesInMilli;

		long elapsedSeconds = different / secondsInMilli;

		System.out.printf(
				"%d days, %d hours, %d minutes, %d seconds%n ", 
				elapsedDays,
				elapsedHours, elapsedMinutes, elapsedSeconds);
		System.out.print("different : " + different);
		System.out.println(" beetween : "+ dateFormat.format(endDate)+" and : " + dateFormat.format(startDate));

	}
}
