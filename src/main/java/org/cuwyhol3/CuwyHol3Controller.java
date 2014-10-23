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

	@RequestMapping(value = "/updatePatient", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> updatePatient(@RequestBody Map<String, Object> patientToUpdate) {
		System.out.println("/removePatient");
		System.out.println(patientToUpdate);
		int updatePatient = cuwyCpoeHolDb2.updatePatient(patientToUpdate);
		List<Map<String, Object>> patient1sList = patient1sList();
		return patient1sList;
	}
	@RequestMapping(value = "/updatePrescribe", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> updatePrescribe(
			@RequestBody Map<String, Object> prescribeToUpdate) {
		logger.debug("------------------");
		System.out.println("/updatePrescribe");
		System.out.println(prescribeToUpdate);
		int updateProtocol = cuwyCpoeHolDb2.updatePrescribeOrder(prescribeToUpdate);
		Integer prescribeId = (Integer) prescribeToUpdate.get("PRESCRIBE_ID");
		Map<String, Object> readPrescribes = readPrescribes(prescribeId);
		String prescribeName = (String) prescribeToUpdate.get("PRESCRIBE_NAME");
		readPrescribes.put("PRESCRIBE_NAME", prescribeName);
		writeToJsonDbFile(readPrescribes, getPrescribeDbJsonName(prescribeId));
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}
	@RequestMapping(value = "/patient1sList", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> patient1sList() {
		System.out.println("/patient1sList");
		List<Map<String, Object>> patient1sList = cuwyCpoeHolDb2.patient1sList();
		writeToJsDbFile("var patient1sList = ", patient1sList, patient1sListJsFileName);
		return patient1sList;
	}
	@RequestMapping(value = "/removePrescribeOrder", method = RequestMethod.POST)
	public @ResponseBody List<Map<String, Object>> removePrescribe(
			@RequestBody Map<String, Object> prescribeToRemove) {
		System.out.println("/removePrescribeOrder");
		System.out.println(prescribeToRemove);
		int removePrescribeId = cuwyCpoeHolDb2.removePrescribeOrder(prescribeToRemove);
		System.out.println(removePrescribeId);
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
	@RequestMapping(value="/read/patient_{patientId}", method=RequestMethod.GET)
	public @ResponseBody Map<String, Object> readPatient(@PathVariable Integer patientId) {
		System.out.println("/read/patient_"+patientId);
		String fileNameWithPathAdd = getPatientDbJsonName(patientId);
		Map<String, Object> readJsonDbFile2map = readJsonDbFile2map(fileNameWithPathAdd);
		if(null == readJsonDbFile2map){
			readJsonDbFile2map = cuwyCpoeHolDb2.readPatient(patientId);
			writeToJsonDbFile(readJsonDbFile2map, fileNameWithPathAdd);
		}
		return readJsonDbFile2map;
	}
	private void writeToJsonDbFile(Object java2jsonObject, String fileName) {
		File file = new File(applicationFolderPfad + innerDbFolderPfad + fileName);
		System.out.println("file");
		System.out.println(file);
		ObjectMapper mapper = new ObjectMapper();
		ObjectWriter writerWithDefaultPrettyPrinter = mapper.writerWithDefaultPrettyPrinter();
		try {
			logger.warn(writerWithDefaultPrettyPrinter.writeValueAsString(java2jsonObject));
			FileOutputStream fileOutputStream = new FileOutputStream(file);
			writerWithDefaultPrettyPrinter.writeValue(fileOutputStream, java2jsonObject);
			System.out.println("java2jsonObject");
			System.out.println(java2jsonObject);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private String prescribeOrder1sListJsFileName = "prescribeOrder1sList.json.js";
//	String applicationFolderPfad = "/home/roman/Documents/01_curepathway/work3/cuwy-cpoe-hol2/";
	String applicationFolderPfad = "/home/roman/01_hol/cuwy-cpoe-hol3/";
	String innerDbFolderPfad = "src/main/webapp/db/";
	private String patient1sListJsFileName = "patient1sList.json.js";

	private Map<String, Object> readJsonDbFile2map(String fileName) {
		String pathToFile = applicationFolderPfad + innerDbFolderPfad + fileName;
		System.out.println(pathToFile);
		File file = new File(pathToFile);
		System.out.println(file);
		ObjectMapper mapper = new ObjectMapper();
		Map<String, Object> readJsonDbFile2map = null;// = new HashMap<String, Object>();
		try {
			readJsonDbFile2map = mapper.readValue(file, Map.class);
		} catch (JsonParseException e1) {
			e1.printStackTrace();
		} catch (JsonMappingException e1) {
			e1.printStackTrace();
		} catch (IOException e1) {
			e1.printStackTrace();
		}
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
			System.out.println(session);
			Map<String, Object> copyObj = (Map<String, Object>) session.getAttribute("copyObj");
			System.out.println(copyObj);
			return copyObj;
		}
		@RequestMapping(value = "/session/copy", method = RequestMethod.POST)
		public @ResponseBody Map<String, Object> sessionCopy(
				@RequestBody Map<String, Object> copyObj, HttpSession session){
			System.out.println(copyObj);
			System.out.println(session);
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
		System.out.println("/saveNewPrescribe");
		System.out.println(newPrescribe);
		newPrescribe = cuwyCpoeHolDb2.newPrescribe(newPrescribe);
		System.out.println(newPrescribe);
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}
	@RequestMapping(value = "/prescribe1sList", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> prescribe1sList() {
		System.out.println("/prescribe1sList");
		List<Map<String, Object>> prescribe1sList = cuwyCpoeHolDb2.prescribe1sList();
		writeToJsDbFile("var prescribeOrder1sList = ", prescribe1sList, prescribeOrder1sListJsFileName);
		return prescribe1sList;
	}
	private void writeToJsDbFile(String variable, Object objectForJson, String fileName) {
		File file = new File(applicationFolderPfad + innerDbFolderPfad + fileName);
		ObjectMapper mapper = new ObjectMapper();
		ObjectWriter writerWithDefaultPrettyPrinter = mapper.writerWithDefaultPrettyPrinter();
		try {
			FileOutputStream fileOutputStream = new FileOutputStream(file);
			fileOutputStream.write(variable.getBytes());
			writerWithDefaultPrettyPrinter.writeValue(fileOutputStream, objectForJson);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
