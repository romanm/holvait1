package org.cuwyhol3;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Lp24RestController {
	private static final Logger logger = LoggerFactory.getLogger(Lp24RestController.class);
	
//	@Autowired private ScheduledTasksWeb scheduledTasks;
	@Autowired private ScheduledTasksClinic scheduledTasks;

	@Autowired private Lp24ControllerImpl lp24Controller;

	//------------------patient----------------------
	@RequestMapping(value="/read/patient_{patientId}", method=RequestMethod.GET)
	public @ResponseBody Map<String, Object> readPatient(@PathVariable Integer patientId) {
		logger.debug("/read/patient_"+patientId);
		return lp24Controller.readPatient(patientId);
	}
	@RequestMapping(value = "/saveNewPatient", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> saveNewPatient(@RequestBody Map<String, Object> newPatient) {
		logger.debug("/saveNewPatient parameters - "+newPatient);
		return lp24Controller.saveNewPatient(newPatient);
	}
	@RequestMapping(value = "/removePatient", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> removePatient(@RequestBody Map<String, Object> patientToRemove) {
		logger.debug("/removePatient");
		return lp24Controller.removePatient(patientToRemove);
	}
	@RequestMapping(value = "/updatePatient", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> updatePatient(@RequestBody Map<String, Object> patientToUpdate) {
		logger.debug("/updatePatient");
		return lp24Controller.updatePatient(patientToUpdate);
	}
	@RequestMapping(value = "/save/patient", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> savePatient(@RequestBody Map<String, Object> patient){
		return lp24Controller.savePatient(patient);
	}
	@RequestMapping(value = "/autosave/patient", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> autoSavePatient(@RequestBody Map<String, Object> documentToSave){
		logger.debug("/autoSaveDocument");
		return lp24Controller.autoSaveDocument(documentToSave);
	}
	@RequestMapping(value = "/patient1sList", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> patient1sList() {
		logger.debug("/patient1sList");
		return lp24Controller.patient1sList();
	}
	//------------------patient---------------END-------

	@RequestMapping(value = "/removePrescribeOrder", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> removePrescribeOrder(
			@RequestBody Map<String, Object> prescribeToRemove) {
		logger.debug("/removePrescribeOrder");
		return lp24Controller.removePrescribeOrder(prescribeToRemove);
	}

	//------------------prescribe----------------------
	@RequestMapping(value="/read/prescribe_{prescribeId}", method=RequestMethod.GET)
	public @ResponseBody Map<String, Object> readPrescribes(@PathVariable Integer prescribeId) {
		logger.debug("/read/prescribe_"+prescribeId);
		return lp24Controller.readPrescribes(prescribeId);
	}
	@RequestMapping(value = "/saveNewPrescribe", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> saveNewPrescribe(
			@RequestBody Map<String, Object> newPrescribe) {
		logger.debug("/saveNewPrescribe");
		return lp24Controller.saveNewPrescribe(newPrescribe);
	}
	@RequestMapping(value = "/saveNewPrescribeFromLocalServer", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> saveNewPrescribeFromLocalServer(
			@RequestBody Map<String, Object> newPrescribe) {
		logger.debug("/saveNewPrescribeFromLocalServer");
		return lp24Controller.saveNewPrescribeFromLocalServer(newPrescribe);
	}
	@RequestMapping(value = "/updatePrescribe", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> updatePrescribe(
			@RequestBody Map<String, Object> prescribeToUpdate) {
		logger.debug("/updatePrescribe prarameters = "+prescribeToUpdate);
		final List<Map<String, Object>> updatePrescribe = lp24Controller.updatePrescribe(prescribeToUpdate);
		logger.debug("/updatePrescribe resault = "+updatePrescribe);
		return updatePrescribe;
	}
	@RequestMapping(value = "/save/prescribes", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> savePrescribes(
			@RequestBody Map<String, Object> prescribes){
		return lp24Controller.savePrescribes(prescribes);
	}
	//reload prescribe list from DB and build new db/prescribeOrder1sList.json.js
	@RequestMapping(value = "/prescribe1sList", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> prescribe1sList() {
		logger.debug("/prescribe1sList");
		return lp24Controller.prescribe1sList();
	}
	@RequestMapping(value = "/prescribe1sListOpen", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> prescribe1sListOpen() {
		logger.debug("/prescribe1sListOpen");
		return lp24Controller.prescribe1sListOpen();
	}
	@RequestMapping(value="/read/{shortServerName}/prescribe_{prescribeId}", method=RequestMethod.GET)
	public @ResponseBody Map<String, Object> readPrescribesInServer(
			@PathVariable String shortServerName
			, @PathVariable Integer prescribeId) {
		return lp24Controller.readPrescribesInServer(shortServerName, prescribeId);
	}
	@RequestMapping(value = "/save/{shortServerName}/prescribes", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> savePrescribesInServer(
			@PathVariable String shortServerName
			,@RequestBody Map<String, Object> prescribes){
		logger.debug("/save/" + shortServerName + "/prescribes");
		logger.debug(" - o - "+prescribes);
		return lp24Controller.savePrescribesInServer(shortServerName, prescribes);
	}
	//------------------prescribe----------------------END

	@RequestMapping(value = "/session/paste", method = RequestMethod.GET)
	public @ResponseBody Map<String, Object> sessionPaste(HttpSession session){
		return lp24Controller.sessionPaste(session);
	}
	@RequestMapping(value = "/session/copy", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> sessionCopy(
			@RequestBody Map<String, Object> copyObj, HttpSession session){
		return lp24Controller.sessionCopy(copyObj, session);
	}

	//------------------drug----------------------
	@RequestMapping(value="/read/drug_{drugId}", method=RequestMethod.GET)
	public @ResponseBody Map<String, Object> readDrug(@PathVariable Integer drugId) {
		return lp24Controller.readDrug(drugId);
	}
	@RequestMapping(value = "/saveNewDrug", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> saveNewDrug(@RequestBody Map<String, Object> newDrug) {
		logger.debug("/saveNewDrug");
		return lp24Controller.saveNewDrug(newDrug);
	}
	@RequestMapping(value = "/save/drug", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> saveDrug(@RequestBody Map<String, Object> drug){
		return lp24Controller.saveDrug(drug);
	}
	@RequestMapping(value = "/updateDrug", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> updateDrug(@RequestBody Map<String, Object> drugToUpdate) {
		logger.debug("/updateDrug");
		return lp24Controller.updateDrug(drugToUpdate);
	}
	@RequestMapping(value = "/removeDrug", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> removeDrug(@RequestBody Map<String, Object> drugToRemove) {
		logger.debug("/removeDrug");
		return lp24Controller.removeDrug(drugToRemove);
	}
	@RequestMapping(value = "/drug1sList", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> drug1sList() {
		return lp24Controller.drug1sList();
	}
	//------------------drug----------------END------
	@RequestMapping(value = "/nextDbId", method = RequestMethod.GET)
	public @ResponseBody Integer nextDbId() {
		return lp24Controller.nextDbId();
	}

	@RequestMapping(value = "/elexRea", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> elexRea() {
		logger.debug("/elexRea");
		return lp24Controller.elexRea();
	}

}
