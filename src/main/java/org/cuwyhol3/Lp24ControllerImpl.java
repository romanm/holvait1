package org.cuwyhol3;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
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

import com.fasterxml.jackson.core.JsonGenerationException;
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
		String fileNameWithPathAdd = Lp24Config.getPatientDbJsonName(patientId);
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
	
	public Map<String, Object> autoSaveDocument(Map<String, Object> documentToSave){
		if(documentToSave.containsKey("PATIENT_ID")){
			autoSavePatient(documentToSave);
		}else if(documentToSave.containsKey("PRESCRIBE_ID")){
			autoSavePrescribes(documentToSave);
		}
		return documentToSave;
	}
	public  Map<String, Object> autoSavePrescribes(Map<String, Object> prescribesToSave){
		savePrescribesToFile(prescribesToSave, (Integer) prescribesToSave.get("PRESCRIBE_ID"));
		return prescribesToSave;
	}
	public  Map<String, Object> autoSavePatient(Map<String, Object> patientToSave){
		savePatienToFile(patientToSave, (Integer) patientToSave.get("PATIENT_ID"));
		return patientToSave;
	}
	public  Map<String, Object> savePrescribes(Map<String, Object> prescribesToSave){
		final Integer prescribesId = (Integer) prescribesToSave.get("PRESCRIBE_ID");
		savePrescribesToFile(prescribesToSave, prescribesId);
		archiveLastSave(prescribesId, Lp24Config.getPrescribeDbJsonName(prescribesId)
				, Lp24Config.getDocumentDbJsonNameArchive(prescribesId, Lp24Config.prescribeDbPrefix));
		return prescribesToSave;
	}
	public  Map<String, Object> savePatient(Map<String, Object> patientToSave){
		Integer patientId = (Integer) patientToSave.get("PATIENT_ID");
		savePatienToFile(patientToSave, patientId);
		archiveLastSave(patientId, Lp24Config.getPatientDbJsonName(patientId)
				, Lp24Config.getDocumentDbJsonNameArchive(patientId, Lp24Config.patientDbPrefix));
		return patientToSave;
	}
	private void archiveLastSave(Integer patientId, final String patientDbJsonName, final String patientDbJsonNameArchive) {
		final Path sourceFile = new File (Lp24Config.jsonDbPhad +  patientDbJsonName).toPath();
		final Path targetArchive = new File (Lp24Config.jsonDbPhad + patientDbJsonNameArchive).toPath();
		try {
			Files.copy(sourceFile, targetArchive);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	private void savePrescribesToFile(Map<String, Object> patientToSave, Integer prescribesId) {
		updateDrugs(patientToSave);
		writeToJsonDbFile(patientToSave, Lp24Config.getPrescribeDbJsonName(prescribesId));
		lp24jdbc.updatePrescribeOrder(patientToSave);
		prescribe1sList();
	}
	private void savePatienToFile(Map<String, Object> patientToSave, Integer patientId) {
		updateDrugs(patientToSave);
		final Date savedDate = new Date();
		patientToSave.put("savedDate", savedDate);
		lp24jdbc.newSavedPatient(patientId, savedDate);
		writeToJsonDbFile(patientToSave, Lp24Config.getPatientDbJsonName(patientId));
		updatePatient(patientToSave);
	}
	
	/**
	 * Update patient name in DB and list of patient file.
	 * @param patientToUpdate
	 * @return
	 */
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

	public boolean updateDrugToBlock1(Map<String, Object> readDrug, Map drug) {
		for (Map prescribeHistory : getInitListOfMaps(readDrug, "prescribesHistory")) {
			final Map prescribes = getInitMap(prescribeHistory, "prescribes");
			List<Map> tasks = getListOfMaps(prescribes, "tasks");
			if(null == tasks){
				tasks = new ArrayList<Map>();
				tasks.add(drug);
				prescribes.put("tasks", tasks);
				return true;
			}else
			for (Map map : tasks) {
				logger.debug(""+map);
				logger.debug(""+(null == map));
				logger.debug(""+map.get("DRUG_ID"));
				if(null == map.get("DRUG_ID")){
					logger.debug("leer");
				}
			}
		}
		return false;
	}

	private void updateDrugs(Map<String, Object> prescribes) {
		for (Map prescribeHistory : getList(prescribes,"prescribesHistory")) {
			for (Map drug : getListOfMaps(getMap(prescribeHistory, "prescribes"), "tasks")) {
				if(null != drug){
					Map<String, Object> drugDocument;
					Integer drugId = (Integer) drug.get("DRUG_ID");
					String drugNameInDoc = (String) drug.get("DRUG_NAME");
					if(null == drugId){
						if(null == drugNameInDoc || "" == drugNameInDoc)
							continue;
						drugDocument = newDrugToDbAndDoc(drug);
					}else{
						drugDocument = readDrug(drugId);
						String drugName = (String) drugDocument.get("DRUG_NAME");
						logger.debug(drugName+"=="+drugNameInDoc+"/"+drugName.equals(drugNameInDoc));
						if(!drugName.equals(drugNameInDoc)){
							final Map<String, Object> readDrugFromName = lp24jdbc.readDrugFromName(drugNameInDoc);
							drugName = (String) readDrugFromName.get("DRUG_NAME");
							logger.debug(drugName+"=="+drugNameInDoc+"/"+drugName.equals(drugNameInDoc));
							if(!drugName.equals(drugNameInDoc)){
								drugDocument = newDrugToDbAndDoc(drug);
							}else{
								drugId = (Integer) readDrugFromName.get("DRUG_ID");
								drugDocument = readDrug(drugId);
							}
						}
					}
					List<Map> doses = addDose2DrugDocument(drug, drugDocument);
					drugDocument.put("doses", doses);
					saveDrug(drugDocument);
				}
			}
		}
		drug1sList();
	}

	private Map<String, Object> newDrugToDbAndDoc(Map drug) {
		Map<String, Object> drugDocument;
		drugDocument = lp24jdbc.newDrug(drug);
		drug.put("DRUG_ID", drugDocument.get("DRUG_ID"));
		return drugDocument;
	}

	private List<Map> getInitListOfMaps(Map<String, Object> map, String key) {
		List<Map> list = getList(map, key);
		if(null == list){
			list = new ArrayList<Map>();
			list.add(new HashMap<String, Object>());
			map.put(key, list);
		}
		return list;
	}
	private List<Map> getList(Map map, String key) {
		return (List<Map>)map.get(key);
	}
	private List<Map> getListOfMaps(Map map, String key) {
		return (List<Map>)map.get(key);
	}
	private Map getInitMap(Map map,final String key) {
		Map mapInMap = getMap(map, key);
		if(null == mapInMap){
			mapInMap = new HashMap<String, Object>();
			map.put(key, mapInMap);
		}
		return mapInMap;
	}
	private Map getMap(Map<String, Object> map, String key) {
		return (Map)map.get(key);
	}
	private List<Map> addDose2DrugDocument(Map drug, Map<String, Object> drugDocument) {
		Set<Map> hashSet = new HashSet<Map>();
		List<Map> ddDoses = getListOfMaps(drugDocument, "doses");
		if(null != ddDoses)
			hashSet.addAll(ddDoses);
		List<Map> dDoses = getListOfMaps(drug, "doses");
		Map dose = getMap(drug, "dose");
		if(null != dose)
			hashSet.add(dose);
		return new ArrayList<Map>(hashSet);
	}
	public List<Map<String, Object>> elexRea() {
		return null;
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
	public List<Map<String, Object>> saveNewPrescribe(Map<String, Object> newPrescribe) {
		lp24jdbc.newPrescribe(newPrescribe);
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}
	private void setExchangeInstall(Integer prescribeId, final Map exchange) {
		Map<String, Object> cuwyConfig = getCuwyConfig();
		final String aliasId = (String) ((Map) cuwyConfig.get("installConfig")).get("aliasId");
		final Map exchangeInstall = new HashMap<String, Object>();
		exchange.put(aliasId, exchangeInstall);
		exchangeInstall.put("id", prescribeId);
	}
	Map<String, Object> saveNewPrescribeFromLocalServer(Map<String, Object> prescribeToExchange) {
		logger.debug("prescribeId = "+prescribeToExchange.get("PRESCRIBE_ID"));
		Map<String, Object> newPrescribe = lp24jdbc.newPrescribe(prescribeToExchange);
		Integer prescribeId = (Integer) newPrescribe.get("PRESCRIBE_ID");
		logger.debug("prescribeId = "+prescribeId);
		Map exchange = (Map) prescribeToExchange.get("exchange");
		setExchangeInstall(prescribeId, exchange);
		prescribeToExchange.put("PRESCRIBE_ID", prescribeId);
		logger.debug("prescribeToExchange = "+prescribeToExchange);
		final String prescribeDbJsonName = lp24Config.getPrescribeDbJsonName(prescribeId);
		logger.debug("prescribeDbJsonName = "+prescribeDbJsonName);
		writeToJsonDbFile(prescribeToExchange, prescribeDbJsonName);
		return prescribeToExchange;
	}

	public List<Map<String, Object>> updatePrescribe(Map<String, Object> prescribeToUpdate) {
		logger.debug(" o "+prescribeToUpdate);
		int updateProtocol = lp24jdbc.updatePrescribeOrder(prescribeToUpdate);
		Integer prescribeId = (Integer) prescribeToUpdate.get("PRESCRIBE_ID");
		logger.debug(" o "+prescribeId);
		Map<String, Object> readPrescribes = readPrescribes(prescribeId);
		logger.debug(" o "+readPrescribes);
		Boolean prescribeRecommend = (Boolean) prescribeToUpdate.get("PRESCRIBE_RECOMMEND");
		readPrescribes.put("PRESCRIBE_RECOMMEND", prescribeRecommend);
		readPrescribes.put("PRESCRIBE_NAME", prescribeToUpdate.get("PRESCRIBE_NAME"));
		writeToJsonDbFile(readPrescribes, lp24Config.getPrescribeDbJsonName(prescribeId));
		if(prescribeRecommend){
			logger.debug("save to server");
			if(!readPrescribes.containsKey("exchange")){
				final Map exchange = new HashMap<String, Object>();
				readPrescribes.put("exchange", exchange);
				setExchangeInstall(prescribeId, exchange);
				logger.debug("save to server saveNewPrescribesInServer 1");
				final Map<String, Object> saveNewPrescribesInServer = saveNewPrescribesInServer("sah", readPrescribes);
				logger.debug("saveNewPrescribesInServer = "+saveNewPrescribesInServer);
				saveNewPrescribesInServer.put("PRESCRIBE_ID", prescribeId);
				logger.debug("saveNewPrescribesInServer = "+saveNewPrescribesInServer);
				writeToJsonDbFile(saveNewPrescribesInServer, lp24Config.getPrescribeDbJsonName(prescribeId));
			}
		}
		prescribe1sListOpen();
		List<Map<String, Object>> prescribe1sList = prescribe1sList();
		return prescribe1sList;
	}

	private Map<String, Object> cuwyConfig = null;
	private Map<String, Object> getCuwyConfig() {
		if(null != cuwyConfig)
			return cuwyConfig;
		String pathToFile = Lp24Config.applicationFolderPfad + Lp24Config.innerDbFolderPfad + "cuwy1.config.js";
		ObjectMapper mapper = new ObjectMapper();
		try {
			BufferedReader 
			br = new BufferedReader(new InputStreamReader(new FileInputStream(pathToFile)));
			br.readLine();
			cuwyConfig = mapper.readValue(br, Map.class);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (JsonParseException e1) {
			e1.printStackTrace();
		} catch (JsonMappingException e1) {
			e1.printStackTrace();
		} catch (IOException e1) {
			e1.printStackTrace();
		}
		logger.debug(" o - "+cuwyConfig);
		return cuwyConfig;
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

	public Map<String, Object> saveNewPrescribesInServer(String shortServerName, Map<String, Object> prescribes) {
		ObjectMapper mapper = new ObjectMapper();
		String url = "http://"+ shortServerName+ ".curepathway.com/saveNewPrescribeFromLocalServer";
		logger.debug(url);
		Map readValue = null;
		HttpURLConnection con = postToUrl(prescribes, mapper, url);
		logger.debug(""+con);
		if(null != con){
			try {
				InputStream requestBody = con.getInputStream();
				logger.debug(""+requestBody);
				readValue = mapper.readValue(requestBody, Map.class);
				logger.debug(""+readValue);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return readValue;
	}
	public Map<String, Object> savePrescribesInServer(String shortServerName, Map<String, Object> prescribes) {
		ObjectMapper mapper = new ObjectMapper();
		String url = "http://"+ shortServerName+ ".curepathway.com/save/prescribes";
		HttpURLConnection con = postToUrl(prescribes, mapper, url);
		try {
			InputStream requestBody = con.getInputStream();
			Map readValue = mapper.readValue(requestBody, Map.class);
			logger.debug("\n"+readValue);

		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}
	private HttpURLConnection postToUrl(Map<String, Object> mapObject,
			ObjectMapper mapper, String url) {
		try {
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();
			con.setRequestMethod("POST");
			con.setDoOutput(true);
			con.setRequestProperty("Content-Type", "application/json"); 
			con.setRequestProperty("charset", "utf-8");
			mapper.writeValue(con.getOutputStream(), mapObject);
			return con;
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (ProtocolException e1) {
			e1.printStackTrace();
		} catch (JsonGenerationException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
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

	Map<String, Object> readJsonDbFile2map(String fileName) {
		String pathToFile = Lp24Config.applicationFolderPfad + Lp24Config.innerDbFolderPfad + fileName;
		File file = new File(pathToFile);
		logger.debug(" o - "+file);
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
	void writeJsonDbVersionInitFile(Object java2jsonObject) {
		final String fileName = lp24Config.applicationFolderPfad + "src/main/resources/dbVersionUpdate.json.sql";
		writeToJsonDbFile(java2jsonObject, fileName);
	}
	void writeToJsonDbFile(Object java2jsonObject, String fileName) {
		File file = new File(Lp24Config.applicationFolderPfad + lp24Config.innerDbFolderPfad + fileName);
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
	
	public Integer nextDbId() {
		return lp24jdbc.nextDbId();
	}
	
}
