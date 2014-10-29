package org.cuwyhol3;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
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

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

@RestController
public class CuwyHol3Controller {
	private static final Logger logger = LoggerFactory.getLogger(CuwyHol3Controller.class);
	
	@Autowired
	private CuwyCpoeHolDb2 cuwyCpoeHolDb2;

	@RequestMapping(value = "/updatePrescribe", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> updatePrescribe(
			@RequestBody Map<String, Object> prescribeToUpdate) {
		logger.debug("/updatePrescribe prarameters = "+prescribeToUpdate);
		int updateProtocol = cuwyCpoeHolDb2.updatePrescribeOrder(prescribeToUpdate);
		Integer prescribeId = (Integer) prescribeToUpdate.get("PRESCRIBE_ID");
		Map<String, Object> readPrescribes = readPrescribes(prescribeId);
		String prescribeName = (String) prescribeToUpdate.get("PRESCRIBE_NAME");
		readPrescribes.put("PRESCRIBE_NAME", prescribeName);
		writeToJsonDbFile(readPrescribes, getPrescribeDbJsonName(prescribeId));
		prescribe1sListOpen();
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}
	//------------------patient----------------------
	@RequestMapping(value = "/saveNewPatient", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> saveNewPatient(@RequestBody Map<String, Object> newPatient) {
		logger.debug("/saveNewPatient parameters - "+newPatient);
		newPatient = cuwyCpoeHolDb2.newPatient(newPatient);
		logger.debug(" o - "+newPatient);
		List<Map<String, Object>> patient1sList = patient1sList();
		return patient1sList;
	}
	@RequestMapping(value = "/removePatient", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> removePatient(@RequestBody Map<String, Object> patientToRemove) {
		logger.debug("/removePatient parameters - "+patientToRemove);
		int removePatientId = cuwyCpoeHolDb2.removePatient(patientToRemove);
		logger.debug(" o - "+removePatientId);
		List<Map<String, Object>> patient1sList = patient1sList();
		return patient1sList;
	}
	@RequestMapping(value = "/updatePatient", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> updatePatient(@RequestBody Map<String, Object> patientToUpdate) {
		logger.debug("/removePatient parameters - "+patientToUpdate);
		int updatePatient = cuwyCpoeHolDb2.updatePatient(patientToUpdate);
		List<Map<String, Object>> patient1sList = patient1sList();
		return patient1sList;
	}
	@RequestMapping(value = "/save/patient", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> savePatient(
			@RequestBody Map<String, Object> patient){
		Integer patientId = (Integer) patient.get("PATIENT_ID");
		String fileNameWithPathAdd = getPatientDbJsonName(patientId);
		writeToJsonDbFile(patient, fileNameWithPathAdd);
		return patient;
	}
	@RequestMapping(value = "/patient1sList", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> patient1sList() {
		logger.debug("/patient1sList");
		List<Map<String, Object>> patient1sList = cuwyCpoeHolDb2.patient1sList();
		writeToJsDbFile("var patient1sList = ", patient1sList, patient1sListJsFileName);
		return patient1sList;
	}
	//------------------patient---------------END-------
	
	//------------------drug----------------------
	@RequestMapping(value = "/saveNewDrug", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> saveNewDrug(@RequestBody Map<String, Object> newDrug) {
		logger.debug("/saveNewDrug");
		logger.debug(" o - "+newDrug);
		newDrug = cuwyCpoeHolDb2.newDrug(newDrug);
		logger.debug(" o - "+newDrug);
		List<Map<String, Object>> drug1sList = drug1sList();
		return drug1sList;
	}
	@RequestMapping(value = "/removeDrug", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> removeDrug(@RequestBody Map<String, Object> drugToRemove) {
		logger.debug("/removeDrug");
		logger.debug(" o - "+drugToRemove);
		int removeDrugId = cuwyCpoeHolDb2.removeDrug(drugToRemove);
		logger.debug(" o - "+removeDrugId);
		List<Map<String, Object>> drug1sList = drug1sList();
		return drug1sList;
	}
	@RequestMapping(value = "/updateDrug", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> updateDrug(@RequestBody Map<String, Object> drugToUpdate) {
		logger.debug("/removeDrug");
		logger.debug(" o - "+drugToUpdate);
		int updateDrug = cuwyCpoeHolDb2.updateDrug(drugToUpdate);
		List<Map<String, Object>> drug1sList = drug1sList();
		return drug1sList;
	}
	@RequestMapping(value = "/drug1sList", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> drug1sList() {
		List<Map<String, Object>> drug1sList = cuwyCpoeHolDb2.drug1sList();
		logger.debug("drug1sList = " + drug1sList);
		writeToJsDbFile("var drug1sList = ", drug1sList, drug1sListJsFileName);
		return drug1sList;
	}
	@RequestMapping(value = "/save/drug", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> saveDrug(
			@RequestBody Map<String, Object> drug){
		Integer prescribeId = (Integer) drug.get("DRUG_ID");
		writeToJsonDbFile(drug, getDrugDbJsonName(prescribeId));
		return drug;
	}
	@RequestMapping(value="/read/drug_{drugId}", method=RequestMethod.GET)
	public @ResponseBody Map<String, Object> readDrug(@PathVariable Integer drugId) {
		String fileNameWithPathAdd = getDrugDbJsonName(drugId);
		Map<String, Object> readJsonDbFile2map = readJsonDbFile2map(fileNameWithPathAdd);
		if(null == readJsonDbFile2map){
			readJsonDbFile2map = cuwyCpoeHolDb2.readDrug(drugId);
			writeToJsonDbFile(readJsonDbFile2map, fileNameWithPathAdd);
		}
		return readJsonDbFile2map;
	}
	//------------------drug----------------END------
	@RequestMapping(value = "/removePrescribeOrder", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> removePrescribe(
			@RequestBody Map<String, Object> prescribeToRemove) {
		logger.debug("/removePrescribeOrder");
		logger.debug(" o - "+prescribeToRemove);
		int removePrescribeId = cuwyCpoeHolDb2.removePrescribeOrder(prescribeToRemove);
		logger.debug(" o - "+removePrescribeId);
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}

	@RequestMapping(value="/read/prescribe_{prescribeId}", method=RequestMethod.GET)
	public @ResponseBody Map<String, Object> readPrescribes(@PathVariable Integer prescribeId) {
		String fileNameWithPathAdd = getPrescribeDbJsonName(prescribeId);
		Map<String, Object> readJsonDbFile2map = readJsonDbFile2map(fileNameWithPathAdd);
		if(null == readJsonDbFile2map){
			readJsonDbFile2map = cuwyCpoeHolDb2.readPrescribe(prescribeId);
			writeToJsonDbFile(readJsonDbFile2map, fileNameWithPathAdd);
		}
		return readJsonDbFile2map;
	}
	@RequestMapping(value="/read/patient_{patientId}", method=RequestMethod.GET)
	public @ResponseBody Map<String, Object> readPatient(@PathVariable Integer patientId) {
		logger.debug("/read/patient_"+patientId);
		String fileNameWithPathAdd = getPatientDbJsonName(patientId);
		Map<String, Object> readJsonDbFile2map = readJsonDbFile2map(fileNameWithPathAdd);
		if(null == readJsonDbFile2map){
			readJsonDbFile2map = cuwyCpoeHolDb2.readPatient(patientId);
			writeToJsonDbFile(readJsonDbFile2map, fileNameWithPathAdd);
		}
		return readJsonDbFile2map;
	}

	private String prescribeOrder1sListJsFileName = "prescribeOrder1sList.json.js";
	private String prescribeOrder1sListOpenJsFileName = "prescribeOrder1sListOpen.json.js";
//	String applicationFolderPfad = "/home/roman/Documents/01_curepathway/work3/cuwy-cpoe-hol2/";
//	String applicationFolderPfad = "/home/roman/01_hol/cuwy-cpoe-hol3/";
	String applicationFolderPfad = "/home/roman/01_hol/holvait1/";
//	String applicationFolderPfad = "/home/roman/01_hol/hol-sec-2";
	String innerDbFolderPfad = "src/main/webapp/db/";
	String innerOpenDbFolderPfad = "src/main/webapp/cuwy/db/";
	private String patient1sListJsFileName = "patient1sList.json.js";
	private String drug1sListJsFileName = "drug1sList.json.js";

	private Map<String, Object> readJsonDbFile2map(String fileName) {
		String pathToFile = applicationFolderPfad + innerDbFolderPfad + fileName;
		logger.debug(pathToFile);
		File file = new File(pathToFile);
		logger.debug(" o - "+file);
		ObjectMapper mapper = new ObjectMapper();
		Map<String, Object> readJsonDbFile2map = null;// = new HashMap<String, Object>();
		try {
			readJsonDbFile2map = mapper.readValue(file, Map.class);
			logger.debug(" o - "+readJsonDbFile2map);
		} catch (JsonParseException e1) {
			e1.printStackTrace();
		} catch (JsonMappingException e1) {
			e1.printStackTrace();
		} catch (IOException e1) {
			e1.printStackTrace();
		}
		logger.debug(" o - "+readJsonDbFile2map);
		return readJsonDbFile2map;
	}
	private String getPatientDbJsonName(Integer patientId) {
		return "patient/patient_"+ patientId+ ".json";
	}
	private String getPrescribeDbJsonName(Integer prescribeId) {
		return "prescribe/prescribe_"+ prescribeId+ ".json";
	}
	private String getDrugDbJsonName(Integer drugId) {
		return "drug/drug_"+ drugId+ ".json";
	}
	//---------prescribes-----------
		@RequestMapping(value = "/session/paste", method = RequestMethod.GET)
		public @ResponseBody Map<String, Object> sessionPaste(HttpSession session){
			logger.debug(" o - "+session);
			Map<String, Object> copyObj = (Map<String, Object>) session.getAttribute("copyObj");
			logger.debug(" o - "+copyObj);
			return copyObj;
		}
		@RequestMapping(value = "/session/copy", method = RequestMethod.POST)
		public @ResponseBody Map<String, Object> sessionCopy(
				@RequestBody Map<String, Object> copyObj, HttpSession session){
			logger.debug(" o - "+copyObj);
			logger.debug(" o - "+session);
			session.setAttribute("copyObj", copyObj);
			return copyObj;
		}
	//------------------prescribe----------------------
	@RequestMapping(value = "/save/prescribes", method = RequestMethod.POST)
	public @ResponseBody Map<String, Object> savePrescribes(
			@RequestBody Map<String, Object> prescribes){
		Integer prescribeId = (Integer) prescribes.get("PRESCRIBE_ID");
		writeToJsonDbFile(prescribes, getPrescribeDbJsonName(prescribeId));
		cuwyCpoeHolDb2.updatePrescribeOrder(prescribes);
		prescribe1sList();
		return prescribes;
	}
	@RequestMapping(value = "/saveNewPrescribe", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> saveNewPrescribe(
			@RequestBody Map<String, Object> newPrescribe) {
		logger.debug("/saveNewPrescribe");
		logger.debug(" o - "+newPrescribe);
		newPrescribe = cuwyCpoeHolDb2.newPrescribe(newPrescribe);
		logger.debug(" o - "+newPrescribe);
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}
	//reload prescribe list from DB and build new db/prescribeOrder1sList.json.js
	@RequestMapping(value = "/prescribe1sList", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> prescribe1sList() {
		logger.debug("/prescribe1sList");
		List<Map<String, Object>> prescribe1sList = cuwyCpoeHolDb2.prescribe1sList();
		writeToJsDbFile("var prescribeOrder1sList = ", prescribe1sList, prescribeOrder1sListJsFileName);
		return prescribe1sList;
	}
	@RequestMapping(value = "/prescribe1sListOpen", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> prescribe1sListOpen() {
		logger.debug("/prescribe1sListOpen");
		List<Map<String, Object>> prescribe1sList = cuwyCpoeHolDb2.prescribe1sListOpen();
		writeToJsDbPathFile("var prescribeOrder1sListOpen = ", prescribe1sList, innerDbFolderPfad + prescribeOrder1sListOpenJsFileName);
		writeToJsDbPathFile("var prescribeOrder1sListOpen = ", prescribe1sList, innerOpenDbFolderPfad + prescribeOrder1sListOpenJsFileName);
		return prescribe1sList;
	}
	private void writeToJsDbFile(String variable, Object objectForJson, String fileName) {
		String dbPathFile = innerDbFolderPfad + fileName;
		writeToJsDbPathFile(variable, objectForJson, dbPathFile);
	}
	private void writeToJsDbPathFile(String variable, Object objectForJson,
			String dbPathFile) {
		File file = new File(applicationFolderPfad + dbPathFile);
		logger.debug("write to file = " + file);
		ObjectMapper mapper = new ObjectMapper();
		ObjectWriter writerWithDefaultPrettyPrinter = mapper.writerWithDefaultPrettyPrinter();
		try {
//			logger.warn(writerWithDefaultPrettyPrinter.writeValueAsString(objectForJson));
			FileOutputStream fileOutputStream = new FileOutputStream(file);
			fileOutputStream.write(variable.getBytes());
			writerWithDefaultPrettyPrinter.writeValue(fileOutputStream, objectForJson);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void writeToJsonDbFile(Object java2jsonObject, String fileName) {
		File file = new File(applicationFolderPfad + innerDbFolderPfad + fileName);
		logger.warn(""+file);
		ObjectMapper mapper = new ObjectMapper();
		ObjectWriter writerWithDefaultPrettyPrinter = mapper.writerWithDefaultPrettyPrinter();
		try {
			logger.warn(writerWithDefaultPrettyPrinter.writeValueAsString(java2jsonObject));
			FileOutputStream fileOutputStream = new FileOutputStream(file);
			writerWithDefaultPrettyPrinter.writeValue(fileOutputStream, java2jsonObject);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
