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
		String url = "jdbc:h2:file:~/01_curepathway/h2-db-server/cuwy-cpoe-hol1";
		logger.debug(":: url = "+url);
		SimpleDriverDataSource dataSource = new SimpleDriverDataSource();
		dataSource.setDriverClass(Driver.class);
		dataSource.setUrl(url);
//		dataSource.setUrl("jdbc:h2:file:C:\\opt\\hol-vait\\db-h2\\cuwy-cpoe-hol1");
		dataSource.setUsername("sa");
//		dataSource.setPassword("");
		this.jdbcTemplate = new JdbcTemplate(dataSource);
		System.out.println("------CuwyCpoeHolDb2-------"+jdbcTemplate);
	}

	public Map<String, Object> readPatient(Integer id) {
		String sql = "SELECT * FROM patient1 WHERE patient_id = ?";
		System.out.println("\n"+sql.replaceFirst("\\?", ""+id));
		List<Map<String, Object>> patient1sList = jdbcTemplate.queryForList(sql, id);
		Map<String, Object> map = patient1sList.get(0);
		return map;
	}

	public Map<String, Object> readPrescribe(Integer id) {
		String sql = "SELECT * FROM prescribe1 WHERE prescribe_id = ?";
		System.out.println("\n"+sql.replaceFirst("\\?", ""+id));
		List<Map<String, Object>> prescribe1sList = jdbcTemplate.queryForList(sql, id);
		Map<String, Object> map = prescribe1sList.get(0);
		return map;
	}

	public Map<String, Object> readDrug(Integer id) {
		String sql = "SELECT * FROM drug1 WHERE drug_id = ?";
		System.out.println("\n"+sql.replaceFirst("\\?", ""+id));
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

	public List<Map<String, Object>> prescribe1sList() {
		String sql = "SELECT * FROM prescribe1 ";
		System.out.println("\n"+sql);
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
		Integer prescribeId = (Integer) prescribeToUpdate.get("PRESCRIBE_ID");
		String sql = "UPDATE prescribe1 SET prescribe_name = ?, prescribe_archive = ?  WHERE prescribe_id = ? ";
		int update = this.jdbcTemplate.update(sql,
			prescribeName, prescribeArchive, prescribeId);
		return update;
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

	public List<Map<String, Object>> patient1sList() {
		String sql = "SELECT * FROM patient1";
		System.out.println("\n"+sql);
		List<Map<String, Object>> patient1sList = jdbcTemplate.queryForList(sql);
		return patient1sList;
	}

}
