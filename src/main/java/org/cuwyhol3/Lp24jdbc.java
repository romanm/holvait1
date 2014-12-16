package org.cuwyhol3;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.h2.Driver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
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
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd' 'HH:mm:ss");
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
				logger.debug("update DB structure to version"+dbVersionId);
				final List<String> sqls = (List<String>) map.get("sqls");
				for (String sql : sqls) {
					if(sql.indexOf("sql_update")>0){
						System.out.println(sql);
						List<Map<String, Object>> sqlUpdateList = jdbcTemplate.queryForList(sql);
						for (Map<String, Object> sqlToUpdateMap : sqlUpdateList) {
							String sqlToUpdate = (String) sqlToUpdateMap.get("sql_update");
							System.out.println(sqlToUpdate);
							jdbcTemplate.update(sqlToUpdate);
							
						}
					}else{
						logger.debug(sql);
						jdbcTemplate.update(sql);
					}
				}
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
		final String sql = "update patient1 set patient_name = ?, patient_archive = ? where patient_id = ?";
		logger.debug(sql.replaceFirst("\\?", patientName).replaceFirst("\\?", patientArchive.toString()).replaceFirst("\\?", patientId.toString()));
		return this.jdbcTemplate.update(sql, patientName, patientArchive, patientId);
	}
	public int removePatient(Map<String, Object> removePatient) {
		Integer patientId = (Integer) removePatient.get("PATIENT_ID");
		int update = jdbcTemplate.update("delete from patient1 where patient_id = ?",patientId);
		return update;
	}

	public Integer nextDbId() {
		return jdbcTemplate.queryForObject("select nextval('dbid')", Integer.class);
	}

	Integer selectForInteger(final String sql, int intParameter) {
		return jdbcTemplate.queryForObject(sql, Integer.class, intParameter);
	}

	private void initDbVersionControl() {
		Map<String, Object> dbVersionControlFile = new HashMap<String, Object>();
		List<Map<String, Object>> dbVersionUpdateList = new ArrayList<Map<String, Object>>();
		Map<String, Object> versionUpdate = new HashMap<String, Object>();
		versionUpdate.put("dbVersionId", 0);
		versionUpdate.put("dbVersionDate", new Date());
		List<String> sqlList = new ArrayList<String>();
		sqlList.add("CREATE TABLE if not exists dbversion (dbversion_ID INT(10) NOT NULL, "
				+ "dbversion_date timestamp default now(), primary key (dbversion_id)");
		sqlList.add("CREATE SEQUENCE  if not exists  dbid");
		versionUpdate.put("sqls", sqlList);
		dbVersionUpdateList.add(versionUpdate);
		dbVersionControlFile.put("dbVersionUpdateList", dbVersionUpdateList);
		writeJsonDbVersionInitFile(dbVersionControlFile);
	}
	
//-------------------- drug ------------------
	public List<Map<String, Object>> drug1sList() {
		String sql = "select d.*, t1.TAG_NAME t1_name from drug1 d "
				+ " left join ("
				+ "select t1.tag_drug_id, CONCAT(t2.tag_name,t1.tag_name) tag_name from TAG1 t1 "
				+ " left join tag1 t2 on t1.tag_pid=t2.tag_id and t1.tag_name is null) "
				+ " t1 on t1.TAG_DRUG_ID = d.DRUG_ID";
		logger.debug("\n"+sql);
		List<Map<String, Object>> drug1sList = jdbcTemplate.queryForList(sql);
		return drug1sList;
	}
	public Map<String, Object> readDrugFromName(String name) {
		String sql = "SELECT * FROM drug1 WHERE drug_name = ?";
		logger.debug("\n"+sql.replaceFirst("\\?", ""+name));
		Map<String, Object> map = null;
		List<Map<String, Object>> prescribe1sList = jdbcTemplate.queryForList(sql, name);
		if(prescribe1sList.size() > 0){
			map = prescribe1sList.get(0);
		}
		return map;
	}
	public Map<String, Object> readDrugFromId(Integer id) {
		String sql = "SELECT * FROM drug1 WHERE drug_id = ?";
		logger.debug("\n"+sql.replaceFirst("\\?", ""+id));
		List<Map<String, Object>> prescribe1sList = jdbcTemplate.queryForList(sql, id);
		Map<String, Object> map = prescribe1sList.get(0);
		return map;
	}
	public int removeDrug(Map<String, Object> removeDrug) {
		Integer drugId = (Integer) removeDrug.get("DRUG_ID");
		int update = jdbcTemplate.update("delete from drug1 where drug_id = ?",drugId);
		return update;
	}
	
	public Map<String, Object> insertDrug(Map<String, Object> newDrug,final Timestamp timestamp) {
		String drugName = (String) newDrug.get("DRUG_NAME");
		jdbcTemplate.update("INSERT INTO drug1 (drug_name,DRUG_SAVEDTS) VALUES (?,?)",drugName,timestamp);
		String sqlSelectDrug1 = "SELECT drug_id FROM drug1 WHERE drug_name = ? limit 1";
		List<Map<String, Object>> drug1sList = jdbcTemplate.queryForList(sqlSelectDrug1, drugName);
		Map<String, Object> nDr = drug1sList.get(0);
		Integer newDrugId = (Integer) nDr.get("DRUG_ID");
		newDrug.put("DRUG_ID", newDrugId);
		return newDrug;
	}
	public int updateDrug(Map<String, Object> drugToUpdate) {
		String drugName = (String) drugToUpdate.get("DRUG_NAME");
		Boolean drugArchive = (Boolean) drugToUpdate.get("DRUG_ARCHIVE");
		Integer drugId = (Integer) drugToUpdate.get("DRUG_ID");
		String sql = "UPDATE drug1 SET drug_name = ?, drug_archive = ? WHERE drug_id = ?";
		int update = this.jdbcTemplate.update(sql,
			drugName, drugArchive, drugId);
		updateDrugSavedTS(drugId, new Timestamp(new Date().getTime()));
		return update;
	}
	public int updateDrugSavedTS(Integer drugId, Timestamp savedTS) {
		String sql = "UPDATE drug1 SET drug_savedts = ? WHERE drug_id = ?";
		logger.debug(sql.replaceFirst("\\?", ""+savedTS).replaceFirst("\\?", ""+drugId));
		int update = this.jdbcTemplate.update(sql, savedTS, drugId);
		return update;
	}
	public int delete1DrugWeb(Integer drugWebId) {
		String sql = "delete from drug_web1 WHERE drug_web_id = ?";
		int update = this.jdbcTemplate.update(sql,  drugWebId);
		return update;
	}
//-------------------- drug-web ------------------
	public Integer countDrugFromWebTable() {
		return jdbcTemplate.queryForObject("select count(*) from drug_web1", Integer.class);
	}
	public void insertDrugFromWebToUpdateCheck(final List<Map<String, Object>> readDrugWeb) {
		String sql = "INSERT INTO DRUG_WEB1 " +
		" (DRUG_WEB_ID, DRUG_WEB_NAME, DRUG_WEB_ARCHIVE, DRUG_WEB_SAVEDTS) VALUES (?, ?, ?, ?)";
		jdbcTemplate.batchUpdate(sql , new BatchPreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement ps, int i) throws SQLException {
				final Map<String, Object> map = readDrugWeb.get(i);
				ps.setInt(1, (Integer) map.get("DRUG_ID"));
				ps.setString(2, (String) map.get("DRUG_NAME"));
				ps.setBoolean(3, (boolean) map.get("DRUG_ARCHIVE"));
				ps.setTimestamp(4, new Timestamp((long) map.get("DRUG_SAVEDTS")));
			}
			@Override
			public int getBatchSize() {
				return readDrugWeb.size();
			}
		});
	}

	void deleteNoCheckableDrugFromWeb() {
		jdbcTemplate.update("delete from DRUG_WEB1 where DRUG_WEB_ARCHIVE ");
		jdbcTemplate.update("DELETE FROM DRUG_WEB1 WHERE DRUG_WEB_ID IN "
		+ "( select DRUG_WEB_ID from DRUG1, DRUG_WEB1 where DRUG_NAME = DRUG_WEB_NAME AND DRUG_SAVEDTS = DRUG_WEB_SAVEDTS)");
	}
	
	public Map<String, Object> getDrugForWebToCheck() {
		String sqlDbVersion = "select * from DRUG_WEB1, DRUG1 "
				+ " where DRUG_NAME = DRUG_WEB_NAME "
				+ " and DRUG_WEB_SAVEDTS != DRUG_SAVEDTS  "
				+ " limit 1";
//		+ " and DRUG_WEB_SAVEDTS > DRUG_SAVEDTS  "
//		+ " and (DRUG_WEB_SAVEDTS != CHECKED_WEB_SAVEDTS or DRUG_WEB_SAVEDTS > DRUG_SAVEDTS) "
//				+ " and DRUG_WEB_SAVEDTS != DRUG_SAVEDTS "
		logger.debug(sqlDbVersion);
		final List<Map<String, Object>> queryForList = jdbcTemplate.queryForList(sqlDbVersion);
		if(null == queryForList || queryForList.isEmpty())
			return null;
		final Map<String, Object> map = queryForList.get(0);
		return map;
	}
	public List<Map<String, Object>> getNewDrugForWeb() {
		final List<Map<String, Object>> queryForList1 = jdbcTemplate.queryForList("select * from DRUG1 left join DRUG_WEB1 on DRUG_NAME = DRUG_WEB_NAME --where DRUG_WEB_ID is null AND DRUG_ARCHIVE = false");
		logger.debug(" - getNewDrugForWeb - "+queryForList1.size());
		String sql = "select * from DRUG1 left join DRUG_WEB1 on DRUG_NAME = DRUG_WEB_NAME where DRUG_WEB_ID is null AND DRUG_ARCHIVE = false";
		logger.debug(" - getNewDrugForWeb - "+sql);
		final List<Map<String, Object>> queryForList = jdbcTemplate.queryForList(sql);
		logger.debug(" - getNewDrugForWeb - "+queryForList);
		return queryForList;
	}
//-------------------- drug-web ------------------END
//-------------------- drug ------------------END
//-------------------- tag ------------------
	public int deleteTag(Integer tagId) {
		String sql = "delete tag1 WHERE tag_id = ?";
		int update = this.jdbcTemplate.update(sql, tagId);
		return update;
	}
	public int updateTagPrescribe(Integer prescribeId, Integer tagId) {
		String sql = "UPDATE tag1 SET tag_Prescribe_id = ? WHERE tag_id = ?";
		int update = this.jdbcTemplate.update(sql, prescribeId, tagId);
		return update;
	}
	public int updateTagDrug(Integer drugId, Integer tagId) {
		String sql = "UPDATE tag1 SET tag_drug_id = ? WHERE tag_id = ?";
		int update = this.jdbcTemplate.update(sql, drugId, tagId);
		return update;
	}
	public int updateParentTag(Integer tagPId, Integer tagId) {
		String sql = "UPDATE tag1 SET tag_pid = ? WHERE tag_id = ?";
		int update = this.jdbcTemplate.update(sql, tagPId, tagId);
		return update;
	}
	public List<Map<String, Object>> tag1sList() {
		String sql = "select t.*, d.drug_name, p.prescribe_name, tt.tag_name as tag_tag_name, t1.tag_id as t1_id, t1.tag_name as t1_name from TAG1 t "
				+ " left join TAG1 t1 on t.TAG_PID = t1.TAG_ID "
				+ " left join DRUG1 d on t.TAG_DRUG_ID = d.DRUG_ID "
				+ " left join prescribe1 p on t.TAG_prescribe_ID = p.prescribe_ID "
				+ " left join TAG1 tt on t.TAG_TAG_ID = tt.TAG_ID";
		logger.debug("\n"+sql);
		List<Map<String, Object>> drug1sList = jdbcTemplate.queryForList(sql);
		return drug1sList;
	}
	public Map<String, Object> insertTag(Map<String, Object> newTag,final Timestamp timestamp) {
		String tagName = (String) newTag.get("TAG_NAME");
		jdbcTemplate.update("INSERT INTO tag1 (tag_name) VALUES (?)",tagName);
		String sqlSelectDrug1 = "SELECT tag_id FROM tag1 WHERE tag_name = ? limit 1";
		List<Map<String, Object>> tag1sList = jdbcTemplate.queryForList(sqlSelectDrug1, tagName);
		Map<String, Object> nDr = tag1sList.get(0);
		Integer newTagId = (Integer) nDr.get("DRUG_ID");
		newTag.put("DRUG_ID", newTagId);
		return newTag;
	}
	
	void insertTagTagChild(final Integer tagTagId, final Integer tagPid) {
		final Integer newTagId = nextDbId();
		final String sql = "INSERT INTO tag1 (TAG_ID, TAG_PID, TAG_TAG_ID) VALUES (?,?,?)";
		logger.debug(sql.replaceFirst("\\?", ""+newTagId).replaceFirst("\\?", ""+tagPid).replaceFirst("\\?", ""+tagTagId));
		jdbcTemplate.update(sql, newTagId, tagPid, tagTagId);
	}
	void insertTagDrugChild(final Integer drugId, final Integer tagPid) {
		final Integer newTagId = nextDbId();
		jdbcTemplate.update("INSERT INTO tag1 (TAG_ID, TAG_PID, TAG_DRUG_ID) VALUES (?,?,?)", newTagId, tagPid, drugId);
	}
	void insertTagPrescribeChild(final Integer prescribeId, final Integer tagPid) {
		final Integer newTagId = nextDbId();
		jdbcTemplate.update("INSERT INTO tag1 (TAG_ID, TAG_PID, TAG_PRESCRIBE_ID) VALUES (?,?,?)", newTagId, tagPid, prescribeId);
	}
//-------------------- tag ------------------END



	

}
