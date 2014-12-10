package org.cuwyhol3;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Lp24Config {
	//windows
	//install windows/clinic
//	final static String applicationFolderPfad = "C:\\opt\\vait-meddoc\\server\\";
//	final static String urlDb = "jdbc:h2:file:C:\\opt\\vait-meddoc\\db-h2\\vait-meddoc\\lp24protocol";
//	final static String innerDbFolderPfad = "src\\main\\webapp\\db\\";

	//install windows/clinic old
//	static String url = "jdbc:h2:file:C:\\opt\\hol-vait\\db-h2\\cuwy-cpoe-hol1";

	//linux
	//prodaction install freehost.ua/holweb
//	final static String applicationFolderPfad = "/home/holweb/server/hol-sec/";
//	final static String urlDb = "jdbc:h2:file:/home/holweb/01_hol/db-h2/holweb-prodaction/lp24protocol";
//	final static String innerDbFolderPfad = "src/main/webapp/cuwy/db/";
//	final static String innerOpenDbFolderPfad = "src/main/webapp/cuwy/db/";

	//develop tasclin/clinic
	final static String applicationFolderPfad = "/home/roman/01_hol_2/holvait1/";
	final static String urlDb = "jdbc:h2:file:~/01_hol_2/db-h2/holvait1-dev/lp24protocol";
	final static String innerDbFolderPfad = "src/main/webapp/db/";
	final static String innerOpenDbFolderPfad = "src/main/webapp/cuwy/db/";

	//develop tasclin/hol-sec
//	final static String applicationFolderPfad = "/home/roman/01_hol_2/holvait1/";
//	static String urlDb = "jdbc:h2:file:~/01_hol_2/db-h2/hol-sec-dev/lp24protocol";
//	final static String innerDbFolderPfad = "src/main/webapp/db/";
//	final static String innerOpenDbFolderPfad = "src/main/webapp/cuwy/db/";

	//test install freehost.ua/holweb
//	final static String applicationFolderPfad = "/home/roman/01_hol_2/hol-sec-2";
//	static String urlDb = "jdbc:h2:file:~/01_hol_2/db-h2/holweb-prodaction-test/lp24protocol";
//	final static String innerDbFolderPfad = "src/main/webapp/db/";
//	final static String innerOpenDbFolderPfad = "src/main/webapp/cuwy/db/";

	final static String jsonDbPhad = applicationFolderPfad + innerDbFolderPfad;
	final static String subDirForPushDrugsFromClinic = "pushedWebNewDrug/";
	final static String archivePrefix = "archive/";
	public final static String patientDbPrefix = "patient/patient_";
	public final static String prescribeDbPrefix = "prescribe/prescribe_";
	public final static String drugDbPrefix = "drug/drug_";
	final static DateFormat df_ymdhms = new SimpleDateFormat("yyyy-MM-dd'_'HH-mm-ss");
	private static String archiveDateStamp() {
		String formatDate = df_ymdhms.format(new Date());
		return formatDate;
	}
	static String getPushedDrugPathName(Integer drugId) {
		return subDirForPushDrugsFromClinic + "drug_" + drugId+ ""
				+ "__"
				+ archiveDateStamp()
				+ ".json";
	}
	static String getDocumentDbJsonNameArchive(Integer docId, String documentDbPrefix) {
		return archivePrefix + documentDbPrefix + docId+ ""
				+ "__"
				+ archiveDateStamp()
				+ ".json";
	}

	static String getPrescribeDbJsonName(Integer prescribeId) { return prescribeDbPrefix+ prescribeId+ ".json"; }
	static String getPatientDbJsonName(Integer patientId) { return patientDbPrefix+ patientId+ ".json"; }
	static String getDrugDbJsonName(Integer drugId) { return drugDbPrefix+ drugId+ ".json"; }

	static String prescribeOrder1sListJsFileName = "prescribeOrder1sList.json.js";
	static String prescribeOrder1sListOpenJsFileName = "prescribeOrder1sListOpen.json.js";
	static String patient1sListJsFileName = "patient1sList.json.js";
	static String drug1sListJsFileName = "drug1sList.json.js";

}
