package org.cuwyhol3;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

@Component("lp24Controller")
public class Lp24ControllerImpl {
	private static final Logger logger = LoggerFactory.getLogger(Lp24ControllerImpl.class);
	private Lp24Config lp24Config;

	@Autowired
	private Lp24jdbc lp24jdbc;

	//------------------patient----------------------------
	public Map<String, Object> readPatient(@PathVariable Integer patientId) {
		String fileNameWithPathAdd = lp24Config.getPatientDbJsonName(patientId);
		Map<String, Object> readJsonDbFile2map = readJsonDbFile2map(fileNameWithPathAdd);
		if(null == readJsonDbFile2map){
			readJsonDbFile2map = lp24jdbc.readPatient(patientId);
			writeToJsonDbFile(readJsonDbFile2map, fileNameWithPathAdd);
		}
		return readJsonDbFile2map;
	}
	public List<Map<String, Object>> saveNewPatient( Map<String, Object> newPatient) {
		newPatient = lp24jdbc.newPatient(newPatient);
		logger.debug(" o - "+newPatient);
		List<Map<String, Object>> patient1sList = patient1sList();
		return patient1sList;
	}
	public  Map<String, Object> savePatient(Map<String, Object> patientToSave){
		Integer patientId = (Integer) patientToSave.get("PATIENT_ID");
		String fileNameWithPathAdd = lp24Config.getPatientDbJsonName(patientId);
		updateDrugs(patientToSave);
		writeToJsonDbFile(patientToSave, fileNameWithPathAdd);
		updatePatient(patientToSave);
		return patientToSave;
	}
	public List<Map<String, Object>> updatePatient(Map<String, Object> patientToUpdate) {
		logger.debug("patientToUpdate - "+patientToUpdate);
		int updatePatient = lp24jdbc.updatePatient(patientToUpdate);
		List<Map<String, Object>> patient1sList = patient1sList();
		return patient1sList;
	}
	public List<Map<String, Object>> removePatient(Map<String, Object> patientToRemove) {
		logger.debug(" parameters - "+patientToRemove);
		int removePatientId = lp24jdbc.removePatient(patientToRemove);
		logger.debug(" o - "+removePatientId);
		List<Map<String, Object>> patient1sList = patient1sList();
		return patient1sList;
	}
	public List<Map<String, Object>> patient1sList() {
		List<Map<String, Object>> patient1sList = lp24jdbc.patient1sList();
		writeToJsDbFile("var patient1sList = ", patient1sList, lp24Config.patient1sListJsFileName);
		return patient1sList;
	}
	//------------------patient----------------------------END
	private void updateDrugs(Map<String, Object> prescribes) {
		for (Object prescribeHistory : getArray(prescribes,"prescribesHistory")) {
			for (Map drug : getMapsArray(getMap((Map)prescribeHistory, "prescribes"), "tasks")) {
				if(null != drug){
					Map<String, Object> drugDocument;
					Integer drugId = (Integer) drug.get("DRUG_ID");
					if(null == drugId){
						Object drugName = drug.get("DRUG_NAME");
						if(null == drugName || "" == drugName)
							continue;
						drugDocument = lp24jdbc.newDrug(drug);
						drug.put("DRUG_ID", drugDocument.get("DRUG_ID"));
					}else{
						drugDocument = readDrug(drugId);
					}
					List<Map> doses = addDose2DrugDocument(drug, drugDocument);
					drugDocument.put("doses", doses);
					saveDrug(drugDocument);
				}
			}
		}
		drug1sList();
	}

	private List getArray(Map map, String key) {
		return (List)map.get(key);
	}
	private List<Map> getMapsArray(Map map, String key) {
		return (List<Map>)map.get(key);
	}
	private Map getMap(Map<String, Object> prescribes, String key) {
		return (Map)prescribes.get(key);
	}
	private List<Map> addDose2DrugDocument(Map drug, Map<String, Object> drugDocument) {
		Set<Map> hashSet = new HashSet<Map>();
		List<Map> ddDoses = getMapsArray(drugDocument, "doses");
		if(null != ddDoses)
			hashSet.addAll(ddDoses);
		List<Map> dDoses = getMapsArray(drug, "doses");
		Map dose = getMap(drug, "dose");
		if(null != dose)
			hashSet.add(dose);
		return new ArrayList<Map>(hashSet);
	}
	//------------------prescribe----------------------------
	public Map<String, Object> readPrescribes(Integer prescribeId) {
		String fileNameWithPathAdd = lp24Config.getPrescribeDbJsonName(prescribeId);
		Map<String, Object> readJsonDbFile2map = readJsonDbFile2map(fileNameWithPathAdd);
		if(null == readJsonDbFile2map){
			readJsonDbFile2map = lp24jdbc.readPrescribe(prescribeId);
			writeToJsonDbFile(readJsonDbFile2map, fileNameWithPathAdd);
		}
		return readJsonDbFile2map;
	}
	public List<Map<String, Object>> saveNewPrescribe(
			Map<String, Object> newPrescribe) {
		newPrescribe = lp24jdbc.newPrescribe(newPrescribe);
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}
	public  Map<String, Object> savePrescribes(Map<String, Object> prescribes){
		Integer prescribeId = (Integer) prescribes.get("PRESCRIBE_ID");
		updateDrugs(prescribes);
		writeToJsonDbFile(prescribes, lp24Config.getPrescribeDbJsonName(prescribeId));
		lp24jdbc.updatePrescribeOrder(prescribes);
		prescribe1sList();
		return prescribes;
	}
	public List<Map<String, Object>> updatePrescribe(
			Map<String, Object> prescribeToUpdate) {
		int updateProtocol = lp24jdbc.updatePrescribeOrder(prescribeToUpdate);
		Integer prescribeId = (Integer) prescribeToUpdate.get("PRESCRIBE_ID");
		Map<String, Object> readPrescribes = readPrescribes(prescribeId);
		String prescribeName = (String) prescribeToUpdate.get("PRESCRIBE_NAME");
		readPrescribes.put("PRESCRIBE_NAME", prescribeName);
		writeToJsonDbFile(readPrescribes, lp24Config.getPrescribeDbJsonName(prescribeId));
		prescribe1sListOpen();
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}

	//reload prescribe list from DB and build new db/prescribeOrder1sList.json.js
	public List<Map<String, Object>> prescribe1sList() {
		logger.debug("prescribe1sList");
		List<Map<String, Object>> prescribe1sList = lp24jdbc.prescribe1sList();
		writeToJsDbFile("var prescribeOrder1sList = ", prescribe1sList, lp24Config.prescribeOrder1sListJsFileName);
		return prescribe1sList;
	}

	public List<Map<String, Object>> prescribe1sListOpen() {
		List<Map<String, Object>> prescribe1sList = lp24jdbc.prescribe1sListOpen();
		writeToJsDbPathFile("var prescribeOrder1sListOpen = ", prescribe1sList,
				lp24Config.innerDbFolderPfad + lp24Config.prescribeOrder1sListOpenJsFileName);
		writeToJsDbPathFile("var prescribeOrder1sListOpen = ", prescribe1sList,
				lp24Config.innerOpenDbFolderPfad + lp24Config.prescribeOrder1sListOpenJsFileName);
		return prescribe1sList;
	}

	private Map<String, Object> readPrescribe(String url) {
		logger.debug(" FROM: "+url );
		ObjectMapper mapper = new ObjectMapper();
		Map<String, Object> responseBody = null;
		try {
			URL serverUrl = new URL(url);
			InputStreamReader inputStreamReader = new InputStreamReader(serverUrl.openStream(), "UTF-8");
			responseBody = mapper.readValue(inputStreamReader, Map.class);
			logger.debug("\n"+responseBody);
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return responseBody;
	}

	public Map<String, Object> readPrescribesInServer(String shortServerName, Integer prescribeId) {
		String url = "http://"+ shortServerName+ ".curepathway.com/read/prescribe_"+prescribeId;
		return readPrescribe(url);
	}

	//------------------prescribe----------------------------END
	//------------------drug----------------------------
	public Map<String, Object> readDrug(Integer drugId) {
		String fileNameWithPathAdd = lp24Config.getDrugDbJsonName(drugId);
		Map<String, Object> readJsonDbFile2map = readJsonDbFile2map(fileNameWithPathAdd);
		if(null == readJsonDbFile2map){
			readJsonDbFile2map = lp24jdbc.readDrug(drugId);
			writeToJsonDbFile(readJsonDbFile2map, fileNameWithPathAdd);
		}
		return readJsonDbFile2map;
	}
	public List<Map<String, Object>> saveNewDrug(Map<String, Object> newDrug) {
		logger.debug(" o - "+newDrug);
		newDrug = lp24jdbc.newDrug(newDrug);
		logger.debug(" o - "+newDrug);
		List<Map<String, Object>> drug1sList = drug1sList();
		return drug1sList;
	}
	public Map<String, Object> saveDrug(Map<String, Object> drug) {
		Integer prescribeId = (Integer) drug.get("DRUG_ID");
		writeToJsonDbFile(drug, lp24Config.getDrugDbJsonName(prescribeId));
		return drug;
	}
	public List<Map<String, Object>> updateDrug(Map<String, Object> drugToUpdate) {
		logger.debug(" o - "+drugToUpdate);
		int updateDrug = lp24jdbc.updateDrug(drugToUpdate);
		List<Map<String, Object>> drug1sList = drug1sList();
		return drug1sList;
	}
	public List<Map<String, Object>> removeDrug(Map<String, Object> drugToRemove) {
		logger.debug(" o - "+drugToRemove);
		int removeDrugId = lp24jdbc.removeDrug(drugToRemove);
		logger.debug(" o - "+removeDrugId);
		List<Map<String, Object>> drug1sList = drug1sList();
		return drug1sList;
	}
	public List<Map<String, Object>> drug1sList() {
		List<Map<String, Object>> drug1sList = lp24jdbc.drug1sList();
		logger.debug("drug1sList = " + drug1sList);
		writeToJsDbFile("var drug1sList = ", drug1sList, lp24Config.drug1sListJsFileName);
		return drug1sList;
	}
	//------------------drug----------------------------END

	private Map<String, Object> readJsonDbFile2map(String fileName) {
		String pathToFile = lp24Config.applicationFolderPfad + lp24Config.innerDbFolderPfad + fileName;
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
	private void writeToJsDbFile(String variable, Object objectForJson, String fileName) {
		String dbPathFile = lp24Config.innerDbFolderPfad + fileName;
		writeToJsDbPathFile(variable, objectForJson, dbPathFile);
	}
	private void writeToJsDbPathFile(String variable, Object objectForJson, String dbPathFile) {
		File file = new File(lp24Config.applicationFolderPfad + dbPathFile);
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
		File file = new File(lp24Config.applicationFolderPfad + lp24Config.innerDbFolderPfad + fileName);
		logger.warn(""+file);
		ObjectMapper mapper = new ObjectMapper();
		ObjectWriter writerWithDefaultPrettyPrinter = mapper.writerWithDefaultPrettyPrinter();
		try {
//			logger.warn(writerWithDefaultPrettyPrinter.writeValueAsString(java2jsonObject));
			FileOutputStream fileOutputStream = new FileOutputStream(file);
			writerWithDefaultPrettyPrinter.writeValue(fileOutputStream, java2jsonObject);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public Map<String, Object> sessionCopy(Map<String, Object> copyObj,
			HttpSession session) {
		session.setAttribute("copyObj", copyObj);
		return copyObj;
	}

	public Map<String, Object> sessionPaste(HttpSession session) {
		Map<String, Object> copyObj = (Map<String, Object>) session.getAttribute("copyObj");
		return copyObj;
	}

	public List<Map<String, Object>> removePrescribeOrder(
			Map<String, Object> prescribeToRemove) {
		logger.debug(" o - "+prescribeToRemove);
		int removePrescribeId = lp24jdbc.removePrescribeOrder(prescribeToRemove);
		logger.debug(" o - "+removePrescribeId);
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}
}
