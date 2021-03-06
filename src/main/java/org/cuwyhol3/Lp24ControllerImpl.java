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
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
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
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm:ss");
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
		final boolean updateDrugs = updateDrugs(patientToSave);
		if(updateDrugs){
			drug1sList();
		}
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

	//----------------works between documents and servers-------------------------------------
	//----------------works between documents -------------------------------------
	//----------------works between documents -------------------------------------END
	//----------------works between servers-------------------------------------
	void margeDrugs(final Map<String, Object> sourceDrug, final Map<String, Object> targetDrug) {
		targetDrug.put("isChanged", false);
		boolean isChanged = addDose2DrugDocument(sourceDrug, targetDrug);
		targetDrug.put("isChanged", isChanged);
		List drugTasks = getPrescribesTasks(targetDrug);
		final List webDrugTasks = getPrescribesTasks(sourceDrug);
		if(webDrugTasks != null){
			if(drugTasks == null)
			{
				targetDrug.put("prescribesHistory", sourceDrug.get("prescribesHistory"));
				targetDrug.put("isChanged", true);
			}else{
				final int hashCode = drugTasks.hashCode();
				final Map prescribesHistoryPrescribes = getPrescribesHistoryPrescribes(targetDrug);
				drugTasks = addListUnique(webDrugTasks, drugTasks);
				if(drugTasks.size() > 5){
					collectingStatistic("tasks",drugTasks,prescribesHistoryPrescribes);
					prescribesHistoryPrescribes.put("tasks", drugTasks.subList(0, 5));
				}else{
					prescribesHistoryPrescribes.put("tasks", drugTasks);
				}
				logger.debug(dateFormat.format(new Date())+" - margeDrugs - "+hashCode+" != " + drugTasks.hashCode()
				+"/"+(hashCode != drugTasks.hashCode()));
				if(hashCode != drugTasks.hashCode())
					targetDrug.put("isChanged", true);
			}
		}
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
	//----------------works between servers-------------------------------------END
	//----------------works between documents and servers-------------------------------------END
	
	public boolean updateDrugToBlock1(Map<String, Object> readDrug, Map drugFromDocument) {
		for (Map prescribeHistory : getInitListOfMaps(readDrug, "prescribesHistory")) {
			final Map prescribes = getInitMap(prescribeHistory, "prescribes");
			List<Map> tasks = getListOfMaps(prescribes, "tasks");
			if(null == tasks){
				tasks = new ArrayList<Map>();
				tasks.add(drugFromDocument);
				prescribes.put("tasks", tasks);
				return true;
			}else{
				boolean drugPrescrbeExist = false;
				final int hashCode = drugFromDocument.hashCode();
				for (Map drugFromDrug : tasks) {
					if(hashCode == drugFromDrug.hashCode()){
						drugPrescrbeExist = true;
						break;
					}
				}
				if(!drugPrescrbeExist){
					tasks.add(drugFromDocument);
					return true;
				}
				logger.debug(drugPrescrbeExist+"/"+tasks);
			}
		}
		return false;
	}

	boolean updateDrugs(Map<String, Object> prescribes) {
		//TODO метод хибний, слід перенести в scheduled task, також повинен працювати тільки для chackedDrug = true 
		if(true)
			return false;
		boolean updateDrug = false;
		final List<Map> list = getList(prescribes,"prescribesHistory");
		if(null != list)
			for (Map prescribeHistory : list) {
				for (Map drug : getListOfMaps(getMap(prescribeHistory, "prescribes"), "tasks")) {
					if(null != drug){
						Map<String, Object> drugDocument;
						Integer drugId = (Integer) drug.get("DRUG_ID");
						String drugNameInPrescribeDoc = (String) drug.get("DRUG_NAME");
						if(null == drugId){
							if(null == drugNameInPrescribeDoc || "" == drugNameInPrescribeDoc)
								continue;
							//save new drug in DB
							drugDocument = newDrugToDbAndDoc(drug);
							updateDrug = true;
						}else{
							drugDocument = readDrug(drugId);
							String drugName = (String) drugDocument.get("DRUG_NAME");
							if(!drugName.equals(drugNameInPrescribeDoc)){//drug from WEB with false ID
								final Map<String, Object> readDrugFromName = lp24jdbc.readDrugFromName(drugNameInPrescribeDoc);
								drugName = (String) readDrugFromName.get("DRUG_NAME");
								if(!drugName.equals(drugNameInPrescribeDoc)){
									//було змінене ім’я, а ID залишився старий, треба створити ліку з новим ім’ям
									drugDocument = newDrugToDbAndDoc(drug);
								}else{
									drugId = (Integer) readDrugFromName.get("DRUG_ID");
									drugDocument = readDrug(drugId);
								}
								updateDrug = true;
							}
						}
						final boolean addDose2DrugDocument = addDose2DrugDocument(drug, drugDocument);
						saveDrug(drugDocument);
					}
				}
			}
		return updateDrug;
	}

	private Map<String, Object> newDrugToDbAndDoc(Map drug) {
		Map<String, Object> drugDocument = lp24jdbc.insertDrug(drug, new Timestamp(new Date().getTime()));
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
	List<Map> getListOfMaps(Map map, String key) {
		return (List<Map>)map.get(key);
	}
	private Map getMap(Map<String, Object> map, String key) {
		return (Map)map.get(key);
	}
	private Map getInitMap(Map map,final String key) {
		Map mapInMap = getMap(map, key);
		if(null == mapInMap){
			mapInMap = new HashMap<String, Object>();
			map.put(key, mapInMap);
		}
		return mapInMap;
	}
	
	private Integer getInt(Map<String, Object> map, String key) {
		final Object object = map.get(key);
		return Integer.parseInt((String) object);
	}
	boolean addDose2DrugDocument(Map<String, Object> drugSource, Map<String, Object> drugTarget) {
		Set<Map> hashSet = new HashSet<Map>();
		List<Map> ddDoses = getListOfMaps(drugTarget, "doses");
		int ddDosesSize = 0;
		if(null != ddDoses){
			ddDosesSize = ddDoses.size();
			hashSet.addAll(ddDoses);
		}
		List<Map> dDoses = getListOfMaps(drugSource, "doses");
		if(null != dDoses)
			hashSet.addAll(dDoses);
		Map dose = getMap(drugSource, "dose");
		if(null != dose)
			hashSet.add(dose);
		final int hashSetSize = hashSet.size();
		//меньше 5 добре, більше 5 треба вибирати кращі
		final List<Map> list = new ArrayList<Map>(hashSet);
		if(hashSetSize > 5){
			drugTarget.put("doses", list.subList(0, 5));
			collectingStatistic("doses",list,drugTarget);
		}else{
			drugTarget.put("doses", list);
		}
		final boolean isChanged = ddDosesSize != hashSetSize;
		return isChanged;
	}
	void collectingStatistic(String nameOfList, List<Map> listToAdd, Map<String, Object> collectionParent) {
		final String nameOfListStatistic = nameOfList+"statistic";
		if(collectionParent.containsKey(nameOfListStatistic))
			collectionParent.put(nameOfListStatistic, new ArrayList<Map>());
		List<Map> list = getList(collectionParent, nameOfListStatistic);
		if(null == list)
		{
			list = new ArrayList<Map>();
			collectionParent.put(nameOfListStatistic, list);
		}
		collectionParent.put(nameOfListStatistic, addListUnique(listToAdd, list));
	}
	ArrayList<Map> addListUnique(List<Map> listToAdd,
			final List<Map> list) {
		Set<Map> hashSet = new HashSet<Map>();
		hashSet.addAll(list);
		hashSet.addAll(listToAdd);
		final ArrayList<Map> arrayList = new ArrayList<Map>(hashSet);
		return arrayList;
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
	private String getInstallAliasId() {
		return (String) ((Map) getCuwyConfig().get("installConfig")).get("aliasId");
	}
	private void setExchangeInstall(Integer prescribeId, final Map exchange) {
		final Map exchangeInstall = new HashMap<String, Object>();
		exchangeInstall.put("id", prescribeId);
		final String aliasId = getInstallAliasId();
		exchange.put(aliasId, exchangeInstall);
	}
	Map<String, Object> saveNewPrescribeFromLocalServer(Map<String, Object> prescribeToExchange) {
		Map exchange = (Map) prescribeToExchange.get("exchange");
		Integer prescribeId = (Integer) ((Map) exchange.get(getInstallAliasId())).get("id");
		if(null == prescribeId){
			prescribeId = (Integer) lp24jdbc.newPrescribe(prescribeToExchange).get("PRESCRIBE_ID");
			setExchangeInstall(prescribeId, exchange);
		}
		prescribeToExchange.put("PRESCRIBE_ID", prescribeId);
		writeToJsonDbFile(prescribeToExchange, lp24Config.getPrescribeDbJsonName(prescribeId));
		return prescribeToExchange;
	}

	public List<Map<String, Object>> updatePrescribe(Map<String, Object> prescribeToUpdate) {
		int updateProtocol = lp24jdbc.updatePrescribeOrder(prescribeToUpdate);
		Integer prescribeId = (Integer) prescribeToUpdate.get("PRESCRIBE_ID");
		Map<String, Object> readPrescribes = readPrescribes(prescribeId);
		Boolean prescribeRecommend = (Boolean) prescribeToUpdate.get("PRESCRIBE_RECOMMEND");
		readPrescribes.put("PRESCRIBE_RECOMMEND", prescribeRecommend);
		readPrescribes.put("PRESCRIBE_NAME", prescribeToUpdate.get("PRESCRIBE_NAME"));
		writeToJsonDbFile(readPrescribes, lp24Config.getPrescribeDbJsonName(prescribeId));
		if(prescribeRecommend){
			if(!readPrescribes.containsKey("exchange")){
				final Map exchange = new HashMap<String, Object>();
				readPrescribes.put("exchange", exchange);
				setExchangeInstall(prescribeId, exchange);
				final Map<String, Object> saveNewPrescribesInServer = saveNewPrescribesInServer("sah", readPrescribes);
				saveNewPrescribesInServer.put("PRESCRIBE_ID", prescribeId);
				writeToJsonDbFile(saveNewPrescribesInServer, lp24Config.getPrescribeDbJsonName(prescribeId));
			}else{
				saveNewPrescribesInServer("sah", readPrescribes);
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
	public List<Map<String, Object>> saveNewTag(Map<String, Object> newTag) {
		logger.debug(" o - "+newTag);
		newTag = lp24jdbc.insertTag(newTag, new Timestamp(new Date().getTime()));
		logger.debug(" o - "+newTag);
		List<Map<String, Object>> drug1sList = tag1sList();
		return drug1sList;
	}
	public List<Map<String, Object>> saveNewDrug(Map<String, Object> newDrug) {
		logger.debug(" o - "+newDrug);
		newDrug = lp24jdbc.insertDrug(newDrug, new Timestamp(new Date().getTime()));
		logger.debug(" o - "+newDrug);
		List<Map<String, Object>> drug1sList = drug1sList();
		return drug1sList;
	}
	public Map<String, Object> saveDrug(Map<String, Object> drug) {
		Integer drugId = (Integer) drug.get("DRUG_ID");
		lp24jdbc.updateDrugSavedTS(drugId, new Timestamp(new Date().getTime()));
		writeToJsonDbFile(drug, lp24Config.getDrugDbJsonName(drugId));
		return drug;
	}
	public List<Map<String, Object>> updateDrug(Map<String, Object> drugToUpdate) {
		logger.debug(" o - "+drugToUpdate);
		int updateDrug = lp24jdbc.updateDrug(drugToUpdate);
		Integer drugId = (Integer) drugToUpdate.get("DRUG_ID");
		final Map<String, Object> readDrugFromId = lp24jdbc.readDrugFromId(drugId);
		final Map<String, Object> readDrug = readDrug(drugId);
		String drugName = (String) drugToUpdate.get("DRUG_NAME");
		readDrug.put("DRUG_NAME", drugName);
		writeToJsonDbFile(readDrug, lp24Config.getDrugDbJsonName(drugId));
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
	public void writeDrug(Integer drugId,Object readJsonDbFile2map) {
		String fileNameWithPathAdd = lp24Config.getDrugDbJsonName(drugId);
		writeToJsonDbFile(readJsonDbFile2map, fileNameWithPathAdd);
	}
	public Map<String, Object> readDrug(Integer drugId) {
		logger.debug(""+drugId);
		final Map<String, Object> readDrugFromId = lp24jdbc.readDrugFromId(drugId);
		String fileNameWithPathAdd = lp24Config.getDrugDbJsonName(drugId);
		Map<String, Object> readJsonDbFile2map = readJsonDbFile2map(fileNameWithPathAdd);
		readJsonDbFile2map.put("savedTS", readDrugFromId.get("DRUG_SAVEDTS"));
		if(null == readJsonDbFile2map){
			writeToJsonDbFile(readDrugFromId, fileNameWithPathAdd);
			readJsonDbFile2map = readDrugFromId;
		}
		return readJsonDbFile2map;
	}
	//------------------drug----------------------------END
	//------------------ drug-web ------------------------------------
	public Map<String, Object> readDrugFromWeb(String shortServerName, Integer drugId) {
		String url = "http://"+ shortServerName+ ".curepathway.com//read/drug_"+drugId;
		Map<String, Object> readValue = null;
		try {
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();
			InputStream requestBody = con.getInputStream();
			readValue = mapper.readValue(requestBody, Map.class);
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return readValue;
	}
	public List<Map<String, Object>> readDrugListeFromWeb(String shortServerName) {
		String url = "http://"+ shortServerName+ ".curepathway.com/drug1sList";
		List<Map<String, Object>> readValue = null;
		try {
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();
			InputStream requestBody = con.getInputStream();
			readValue = mapper.readValue(requestBody, List.class);
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return readValue;
	}
	public void pushNewDrugsToWebServer(String sah) {
		final List<Map<String, Object>> newDrugForWeb = lp24jdbc.getNewDrugForWeb();
		System.out.println(newDrugForWeb.size());
		for (Map<String, Object> map : newDrugForWeb) {
			Integer drugId = (Integer) map.get("DRUG_ID");
			final Map<String, Object> drug = readDrug(drugId);
			drug.put("savedTS", map.get("DRUG_SAVEDTS"));
			pushWebNewDrug(sah, drug);
		}
	}
	Map<String, Object> pushedWebNewDrug(Map<String, Object> drug) {
		Integer drugId = (Integer) drug.get("DRUG_ID");
		final String pushedDrugPathName = lp24Config.getPushedDrugPathName(drugId);
		logger.debug(pushedDrugPathName);
		writeToJsonDbFile(drug, pushedDrugPathName);
		final Map<String, Object> mapDrug = new HashMap<String, Object>();
		mapDrug.put("id", drugId);
		return mapDrug;
	}
	Map<String, Object> pushWebNewDrug(String shortServerName, Map<String, Object> drug) {
		String url = "http://"+ shortServerName+ ".curepathway.com/pushedWebNewDrug";
		logger.debug(url);
		HttpURLConnection con = postToUrl(drug, mapper, url);
		logger.debug(""+con);
		Map<String, Object>  readValue = null;
		if(null != con){
			try {
				InputStream requestBody = con.getInputStream();
				readValue = mapper.readValue(requestBody, Map.class);
				logger.debug(""+readValue);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return readValue;
	}
	ObjectMapper mapper = new ObjectMapper();
	
	//------------------ drug-web ------------------------------------END

	public Map<String, Object> sessionCopy(Map<String, Object> copyObj, HttpSession session) {
		session.setAttribute("copyObj", copyObj);
		return copyObj;
	}

	public Map<String, Object> sessionPaste(HttpSession session) {
		Map<String, Object> copyObj = (Map<String, Object>) session.getAttribute("copyObj");
		return copyObj;
	}

	public Map<String, Object> tagDelete(Map<String, Object> tagDelete, HttpSession session) {
		Integer tagId = (Integer) tagDelete.get("TAG_ID");
		final Integer usedCount = lp24jdbc.selectForInteger("select count(*) from tag1 where ? in (tag_pid,tag_tag_id)",tagId);
		final Map<String, Object> tagModel;
		if(usedCount>0){
			tagModel = tagModel();
			final String string = "Неможливо видалити - використовується "
					+ usedCount
					+" "+ (usedCount==1?"раз":(usedCount>4?"разів": " рази"));
			writeError(tagId, tagModel, string);
		}else if(tagDelete.get("DRUG_NAME") != null){
			tagModel = tagModel();
			final String string = "Неможливо видалити - використовує медикамент ";
			writeError(tagId, tagModel, string);
		}else{
			lp24jdbc.deleteTag(tagId);
			tagModel = tagModel();
		}
		return tagModel;
	}
	private void writeError(Integer intParameter,
			final Map<String, Object> tagModel, final String string) {
		Integer index = (Integer) ((Map) tagModel.get("tagsIdIndex")).get(intParameter);
		List tag1sList = (List) tagModel.get("tag1sList");
		final Map newPasteObj = (Map) tag1sList.get(index);
		newPasteObj.put("error", string);
	}

	public Map<String, Object> tagDrugDelete(Map<String, Object> pasteObj, HttpSession session) {
		final Integer pastePlaceTagId = (Integer) pasteObj.get("TAG_ID");
		logger.debug(pastePlaceTagId+" / "+pasteObj);
		lp24jdbc.updateTagDrug(null, pastePlaceTagId);
		final Map<String, Object> tagModel = tagModel();
		return tagModel;
	}
	public Map<String, Object> tagPaste(Map<String, Object> pasteObj, HttpSession session) {
		final Integer pastePlaceTagId = (Integer) pasteObj.get("TAG_ID");
		logger.debug(pastePlaceTagId+" / "+pasteObj);
		Map<String, Object> copyObj = (Map<String, Object>) session.getAttribute("copyObj");
		final Integer copyTagId = (Integer) copyObj.get("TAG_ID");
		logger.debug(copyTagId+" / "+copyObj);
		if(null != copyTagId){
			logger.debug(""+pastePlaceTagId);
			logger.debug(""+pasteObj.get("TAG_PID"));
			if(pasteObj.get("TAG_PID") != null){
				lp24jdbc.updateParentTag(pastePlaceTagId, copyTagId);
			}else{
				lp24jdbc.insertTagTagChild(copyTagId, pastePlaceTagId);
			}
		}else{
			final Integer copyDrugId = (Integer) copyObj.get("DRUG_ID");
			if(copyDrugId != null){
				if(pasteObj.get("TAG_DRUG_ID") != null)
				{
					lp24jdbc.insertTagDrugChild(copyDrugId, getTagPid(pasteObj));
				}else{
					lp24jdbc.updateTagDrug(copyDrugId, pastePlaceTagId);
				}
			}else{
				final Integer copyPrescribeId = (Integer) copyObj.get("PRESCRIBE_ID");
				logger.debug(copyPrescribeId+" / "+copyObj);
				if(copyPrescribeId != null){
					if(pasteObj.get("TAG_PRESCRIBE_ID") != null)
					{
						lp24jdbc.insertTagPrescribeChild(copyDrugId, getTagPid(pasteObj));
					}else{
						lp24jdbc.updateTagPrescribe(copyPrescribeId, pastePlaceTagId);
					}
				}
			}
		}
		final Map<String, Object> tagModel = tagModel();
		return tagModel;
	}
	private Integer getTagPid(Map<String, Object> pasteObj) {
		Integer newTagPid;
		if(pasteObj.get("TAG_NAME") == null)
			newTagPid = (Integer) pasteObj.get("TAG_PID");
		else
			newTagPid = (Integer) pasteObj.get("TAG_ID");
		return newTagPid;
	}

	public List<Map<String, Object>> tag1sList() {
		List<Map<String, Object>> tag1sList = lp24jdbc.tag1sList();
		return tag1sList;
	}
	Map<String, Object> tagModel() {
		final Map<String, Object> tagModel = new HashMap<String, Object>();
		Map<Integer, Map> tagTreeMap = new HashMap<Integer, Map>();
		Map<Integer, Map> losChildMaps = new HashMap<Integer, Map>();
		Map<Integer, Integer> tagsIdIndex = new HashMap<Integer, Integer>();
		List<Map<String, Object>> tag1sList = lp24jdbc.tag1sList();
		int index = 0;
		for (Map<String, Object> map : tag1sList) {
			final Integer tagId = (Integer) map.get("TAG_ID");
			tagsIdIndex.put(tagId, index++);
			final Integer tagPid = (Integer) map.get("TAG_PID");
			if(losChildMaps.containsKey(tagId)){
				final Map<Integer, Map> childs = getInitChilds(map);
				childs.putAll(losChildMaps.get(tagId));
			}
			if(null == tagPid){
				addItem(tagId, tagsIdIndex, tagTreeMap);
			}else{
				final Integer tIndex = tagsIdIndex.get(tagPid);
				if(null == tIndex){
					Map losChildMap = losChildMaps.get(tagPid);
					if(losChildMap == null){
						losChildMap = new HashMap<Integer, Object>();
						losChildMaps.put(tagPid, losChildMap);
					}
					losChildMap.put(tagId, makeTreeIemMap(index));
				}else{
					final Map parentMap = tag1sList.get(tIndex);
					Map<Integer, Map> childs = getInitChilds(parentMap);
					addItem(tagId, tagsIdIndex, childs);
				}
			}
		}
		tagModel.put("tag1sList", tag1sList);
		tagModel.put("tagTree", tagTreeMap);
		tagModel.put("tagsIdIndex", tagsIdIndex);
		writeToJsDbFile("var tagModel = ", tagModel, lp24Config.tagModelJsFileName);
		return tagModel;
	}
	private void addItem(Integer tagId, Map<Integer, Integer> tagsIdIndex, Map<Integer, Map> parent) {
		final HashMap<String, Object> treeItemMap = makeTreeIemMap(tagsIdIndex.get(tagId));
		parent.put(tagId, treeItemMap);
	}
	private HashMap<String, Object> makeTreeIemMap(Integer index) {
		final HashMap<String, Object> treeItemMap = new HashMap<String, Object>();
		treeItemMap.put("index", index);
		return treeItemMap;
	}
	private void addChild(Map<String, Object> map, final Integer tagId, Map<Integer, Object> parent) {
		parent.put(tagId, 0);
	}
	private Map<Integer, Map> getInitChilds(final Map parentMap) {
		Map<Integer, Map> childs = (Map<Integer, Map>) parentMap.get("childs");
		if(null == childs){
			childs = new HashMap<Integer, Map>();
			parentMap.put("childs", childs);
		}
		return childs;
	}
	Map<String, Object> readJsonDbFile2map(String fileName) {
		String pathToFile = Lp24Config.applicationFolderPfad + Lp24Config.innerDbFolderPfad + fileName;
		File file = new File(pathToFile);
		return readJsonDbFile2map(file);
	}
	Map<String, Object> readJsonDbFile2map(File file) {
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
	void writeToJsonDbFile(Map java2jsonObject, String fileName) {
		//delete old parameters and document tiles
		java2jsonObject.remove("savedTs");
		writeToJsonDbFile((Object) java2jsonObject, fileName);
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
