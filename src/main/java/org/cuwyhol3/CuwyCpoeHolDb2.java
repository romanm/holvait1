package org.cuwyhol3;

import java.util.List;
import java.util.Map;

import org.h2.Driver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SimpleDriverDataSource;
import org.springframework.stereotype.Component;

@Component("cuwyCpoeHolDb2")
public class CuwyCpoeHolDb2 {
	private static final Logger logger = LoggerFactory.getLogger(CuwyCpoeHolDb2.class);

	private JdbcTemplate jdbcTemplate;
	
	public CuwyCpoeHolDb2() {
		String url = "jdbc:h2:file:~/01_hol/h2-db/holvait1/lp24protocol";
//		String url = "jdbc:h2:file:~/01_hol/db-h2/hol-sec-2/lp24protocol";
//		String url = "jdbc:h2:file:~/01_hol/db-h2/holweb/lp24protocol";
//		String url = "jdbc:h2:file:C:\\opt\\hol-vait\\db-h2\\cuwy-cpoe-hol1";
		logger.debug(":: url = "+url);
		SimpleDriverDataSource dataSource = new SimpleDriverDataSource();
		dataSource.setDriverClass(Driver.class);
		dataSource.setUrl(url);
		dataSource.setUsername("sa");
//		dataSource.setPassword("");
		this.jdbcTemplate = new JdbcTemplate(dataSource);
		logger.debug("------CuwyCpoeHolDb2-------"+jdbcTemplate);
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
		Boolean prescribeRecommend = (Boolean) prescribeToUpdate.get("PRESCRIBE_RECOMMEND");
		Integer prescribeId = (Integer) prescribeToUpdate.get("PRESCRIBE_ID");
		String sql = "UPDATE prescribe1 SET prescribe_name = ?"
				+ ", prescribe_archive = ? "
				+ ", PRESCRIBE_RECOMMEND = ? "
				+ " WHERE prescribe_id = ? ";
		int update = this.jdbcTemplate.update(sql,
			prescribeName, prescribeArchive, prescribeRecommend, prescribeId);
		return update;
	}
	

	public List<Map<String, Object>> patient1sList() {
		String sql = "SELECT * FROM patient1";
		logger.debug("\n"+sql);
		List<Map<String, Object>> patient1sList = jdbcTemplate.queryForList(sql);
		return patient1sList;
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
		Integer newDrugId = (Integer) drug1sList.get(0).get("DRUG_ID");
		newDrug.put("DRUG_ID", newDrugId);
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

}
