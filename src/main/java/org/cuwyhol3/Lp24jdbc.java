package org.cuwyhol3;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.h2.Driver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SimpleDriverDataSource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

@Component("lp24jdbc")
public class Lp24jdbc {
	
//	@Autowired
//	private Lp24ControllerImpl lp24Controller;

	private static final Logger logger = LoggerFactory.getLogger(Lp24jdbc.class);
	private Lp24Config lp24Config;

	private JdbcTemplate jdbcTemplate;
	
	public Lp24jdbc() {
		logger.debug(":: url = "+lp24Config.urlDb);

		SimpleDriverDataSource dataSource = new SimpleDriverDataSource();
		dataSource.setDriverClass(Driver.class);
		dataSource.setUrl(lp24Config.urlDb);
		dataSource.setUsername("sa");
//		dataSource.setPassword("");
		this.jdbcTemplate = new JdbcTemplate(dataSource);
		logger.debug("------CuwyCpoeHolDb2-------"+jdbcTemplate);
		updateDbVersion();
	}

	private void updateDbVersion() {
//		initDbVersionControl();
		final Map<String, Object> dbVersionUpdate = readJsonDbFile2map();
		final List<Map> sqlVersionUpdateList = (List) dbVersionUpdate.get("dbVersionUpdateList");
		final List<String> sqls0 = (List<String>) ((Map) sqlVersionUpdateList.get(0)).get("sqls");
		for (String sql : sqls0) 
			jdbcTemplate.update(sql);
		String sqlDbVersion = "select * from DBVERSION ORDER BY DBVERSION_ID DESC LIMIT 1";
		List<Map<String, Object>> dbVersion = jdbcTemplate.queryForList(sqlDbVersion);
		int thisDbVersionId = dbVersion.size() == 0 ? 0:(int) dbVersion.get(0).get("DBVERSION_ID");
		logger.debug(""+thisDbVersionId);
		for (Map map : sqlVersionUpdateList) {
			final Integer dbVersionId = (Integer) map.get("dbVersionId");
			if(dbVersionId > thisDbVersionId){
				final List<String> sqls = (List<String>) map.get("sqls");
				for (String sql : sqls) 
					jdbcTemplate.update(sql);
				jdbcTemplate.update("INSERT INTO DBVERSION (DBVERSION_ID) VALUES (?)",dbVersionId);
			}
		}
	}

	final String fileNameDbVersionUpdate = lp24Config.applicationFolderPfad + "src/main/resources/dbVersionUpdate.sql.json.js";
	final String fileNameDbInit = lp24Config.applicationFolderPfad + "src/main/resources/dbVersionUpdateInit.json.sql";
	private Map<String, Object> readJsonDbFile2map() {
		logger.debug(fileNameDbVersionUpdate);
		File file = new File(fileNameDbVersionUpdate);
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
	void writeJsonDbVersionInitFile(Object java2jsonObject) {
		File file = new File(fileNameDbInit);
		logger.debug(fileNameDbInit+" - "+file);
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

	public Map<String, Object> readSavedPatient() {
		String sql = "SELECT * FROM patient1 where PATIENT_CHECKED = false ORDER BY patient_savedts ASC LIMIT 1";
		List<Map<String, Object>> patient1sList = jdbcTemplate.queryForList(sql);
		if(patient1sList.isEmpty())
			return null;
		Map<String, Object> map = patient1sList.get(0);
		return map;
	}
	public Map<String, Object> readPatient(Integer id) {
		String sql = "SELECT * FROM patient1 WHERE patient_id = ?";
		logger.debug("\n"+sql.replaceFirst("\\?", ""+id));
		List<Map<String, Object>> patient1sList = jdbcTemplate.queryForList(sql, id);
		Map<String, Object> map = patient1sList.get(0);
		return map;
	}

	public Map<String, Object> readPrescribe(Integer id) {
		String sql = "SELECT * FROM prescribe1 WHERE prescribe_id = ?";
		logger.debug("\n"+sql.replaceFirst("\\?", ""+id));
		List<Map<String, Object>> prescribe1sList = jdbcTemplate.queryForList(sql, id);
		Map<String, Object> map = prescribe1sList.get(0);
		return map;
	}

	public Map<String, Object> readDrugFromName(String name) {
		String sql = "SELECT * FROM drug1 WHERE drug_name = ?";
		logger.debug("\n"+sql.replaceFirst("\\?", ""+name));
		List<Map<String, Object>> prescribe1sList = jdbcTemplate.queryForList(sql, name);
		Map<String, Object> map = prescribe1sList.get(0);
		return map;
	}
	public Map<String, Object> readDrug(Integer id) {
		String sql = "SELECT * FROM drug1 WHERE drug_id = ?";
		logger.debug("\n"+sql.replaceFirst("\\?", ""+id));
		List<Map<String, Object>> prescribe1sList = jdbcTemplate.queryForList(sql, id);
		Map<String, Object> map = prescribe1sList.get(0);
		return map;
	}

	public Map<String, Object> newPrescribe(Map<String, Object> newPrescribeOrder) {
		Object prescribeName = newPrescribeOrder.get("PRESCRIBE_NAME");
		jdbcTemplate.update("INSERT INTO prescribe1 (prescribe_name) VALUES (?)",prescribeName);
		String sqlSelectPatient1 = "SELECT prescribe_id FROM prescribe1 WHERE prescribe_name = ? ORDER BY prescribe_id DESC LIMIT 1";
		List<Map<String, Object>> prescribe1sList = jdbcTemplate.queryForList(sqlSelectPatient1, prescribeName);
		Integer newPrescribeId = (Integer) prescribe1sList.get(0).get("PRESCRIBE_ID");
		newPrescribeOrder.put("PRESCRIBE_ID", newPrescribeId);
		return newPrescribeOrder;
	}

	public List<Map<String, Object>> prescribe1sListOpen() {
		String sql = "SELECT * FROM prescribe1 WHERE PRESCRIBE_RECOMMEND IS TRUE ";
		logger.debug("\n"+sql);
		List<Map<String, Object>> prescribe1sList = jdbcTemplate.queryForList(sql);
		return prescribe1sList;
	}
	public List<Map<String, Object>> prescribe1sList() {
		String sql = "SELECT * FROM prescribe1 ";
		logger.debug("\n"+sql);
		List<Map<String, Object>> prescribe1sList = jdbcTemplate.queryForList(sql);
		return prescribe1sList;
	}

	public int removePrescribeOrder(Map<String, Object> removePatient) {
		Integer prescribeId = (Integer) removePatient.get("PRESCRIBE_ID");
		int update = jdbcTemplate.update("DELETE FROM prescribe1 WHERE prescribe_id = ?",prescribeId);
		return update;
	}
	public int updateDrug(Map<String, Object> drugToUpdate) {
		String drugName = (String) drugToUpdate.get("DRUG_NAME");
		Boolean drugArchive = (Boolean) drugToUpdate.get("DRUG_ARCHIVE");
		Integer drugId = (Integer) drugToUpdate.get("DRUG_ID");
		String sql = "UPDATE drug1 SET drug_name = ?, drug_archive = ? WHERE drug_id = ?";
		int update = this.jdbcTemplate.update(sql,
			drugName, drugArchive, drugId);
		return update;
	}
	public int updatePrescribeOrder(Map<String, Object> prescribeToUpdate) {
		String prescribeName = (String) prescribeToUpdate.get("PRESCRIBE_NAME");
		Boolean prescribeArchive = (Boolean) prescribeToUpdate.get("PRESCRIBE_ARCHIVE");
		prescribeArchive = null == prescribeArchive ? false : prescribeArchive;
		Boolean prescribeRecommend = (Boolean) prescribeToUpdate.get("PRESCRIBE_RECOMMEND");
		prescribeRecommend = null == prescribeRecommend ? false : prescribeRecommend;
		Integer prescribeId = (Integer) prescribeToUpdate.get("PRESCRIBE_ID");
		String sql = "UPDATE prescribe1 SET prescribe_name = ?"
				+ ", prescribe_archive = ? "
				+ ", PRESCRIBE_RECOMMEND = ? "
				+ " WHERE prescribe_id = ? ";
		int update = this.jdbcTemplate.update(sql, prescribeName, prescribeArchive, prescribeRecommend, prescribeId);
		return update;
	}
	

	public List<Map<String, Object>> patient1sList() {
		String sql = "SELECT * FROM patient1";
		logger.debug("\n"+sql);
		List<Map<String, Object>> patient1sList = jdbcTemplate.queryForList(sql);
		return patient1sList;
	}
	public void updateSavedPatientIsChecked(int patientId) {
		jdbcTemplate.update("UPDATE patient1 SET patient_checked = true WHERE patient_id = ?"
				,patientId);
	}
	public void newSavedPatient(Integer patientId, Date savedDate) {
		jdbcTemplate.update("UPDATE patient1 SET patient_checked = false, patient_savedts = ? WHERE patient_id = ?"
				,savedDate,patientId);
	}
	public Map<String, Object> newPatient(Map<String, Object> newPatient) {
		Object patientName = newPatient.get("PATIENT_NAME");
		jdbcTemplate.update("INSERT INTO patient1 (patient_name) VALUES (?)",patientName);
		String sqlSelectPatient1 = "SELECT patient_id FROM patient1 WHERE patient_name = ? limit 1";
		List<Map<String, Object>> patient1sList = jdbcTemplate.queryForList(sqlSelectPatient1, patientName);
		Integer newPatientId = (Integer) patient1sList.get(0).get("PATIENT_ID");
		newPatient.put("PATIENT_ID", newPatientId);
		return newPatient;
	}
	public int updatePatient(Map<String, Object> patientToUpdate) {
		String patientName = (String) patientToUpdate.get("PATIENT_NAME");
		Boolean patientArchive = (Boolean) patientToUpdate.get("PATIENT_ARCHIVE");
		Integer patientId = (Integer) patientToUpdate.get("PATIENT_ID");
		int update = this.jdbcTemplate.update(
				"update patient1 set patient_name = ?, patient_archive = ? where patient_id = ?",
				patientName, patientArchive, patientId);
		return update;
	}
	public int removePatient(Map<String, Object> removePatient) {
		Integer patientId = (Integer) removePatient.get("PATIENT_ID");
		int update = jdbcTemplate.update("delete from patient1 where patient_id = ?",patientId);
		return update;
	}

	public Map<String, Object> newDrug(Map<String, Object> newDrug) {
		Object drugName = newDrug.get("DRUG_NAME");
		logger.debug(""+drugName+"/"+newDrug);
		jdbcTemplate.update("INSERT INTO drug1 (drug_name) VALUES (?)",drugName);
		String sqlSelectDrug1 = "SELECT drug_id FROM drug1 WHERE drug_name = ? limit 1";
		List<Map<String, Object>> drug1sList = jdbcTemplate.queryForList(sqlSelectDrug1, drugName);
		logger.debug(""+drug1sList);
		Map<String, Object> nDr = drug1sList.get(0);
		logger.debug(""+nDr);
		Integer newDrugId = (Integer) nDr.get("DRUG_ID");
		logger.debug(""+newDrugId);
		newDrug.put("DRUG_ID", newDrugId);
		logger.debug(""+newDrug);
		return newDrug;
	}

	public int removeDrug(Map<String, Object> removeDrug) {
		Integer drugId = (Integer) removeDrug.get("DRUG_ID");
		int update = jdbcTemplate.update("delete from drug1 where drug_id = ?",drugId);
		return update;
	}

	public List<Map<String, Object>> drug1sList() {
		String sql = "SELECT * FROM drug1";
		logger.debug("\n"+sql);
		List<Map<String, Object>> drug1sList = jdbcTemplate.queryForList(sql);
		return drug1sList;
	}
	public Integer nextDbId() {
		return jdbcTemplate.queryForObject("select nextval('dbid')", Integer.class);
	}

	private void initDbVersionControl() {
		Map dbVersionControlFile = new HashMap<String, Object>();
		List dbVersionUpdateList = new ArrayList<Map>();
		Map versionUpdate = new HashMap<String, Object>();
		versionUpdate.put("dbVersionId", 0);
		versionUpdate.put("dbVersionDate", new Date());
		List sqlList = new ArrayList<List>();
		sqlList.add("CREATE TABLE if not exists dbversion (dbversion_ID INT(10) NOT NULL, "
				+ "dbversion_date timestamp default now(), primary key (dbversion_id)");
		sqlList.add("CREATE SEQUENCE  if not exists  dbid");
		versionUpdate.put("sqls", sqlList);
		dbVersionUpdateList.add(versionUpdate);
		dbVersionControlFile.put("dbVersionUpdateList", dbVersionUpdateList);
		writeJsonDbVersionInitFile(dbVersionControlFile);
	}

	


}
