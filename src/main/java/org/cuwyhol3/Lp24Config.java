package org.cuwyhol3;

public class Lp24Config {
	//windows
	//install windows/clinic
//	static String applicationFolderPfad = "C:\\opt\\vait.curepathway\\server\\";
//	static String urlDb = "jdbc:h2:file:C:\\opt\\vait.curepathway\\db-h2\\holvait1-prodaction\\lp24protocol";
//	static String innerDbFolderPfad = "src\\main\\webapp\\db\\";

	//install windows/clinic old
//	static String url = "jdbc:h2:file:C:\\opt\\hol-vait\\db-h2\\cuwy-cpoe-hol1";

	//linux
	//develop tasclin/clinic
	static String urlDb = "jdbc:h2:file:~/01_hol_2/db-h2/holvait1-dev/lp24protocol";
	static String applicationFolderPfad = "/home/roman/01_hol_2/holvait1/";

	//develop tasclin/hol-sec
//	static String url = "jdbc:h2:file:~/01_hol_2/db-h2/hol-sec-dev/lp24protocol";

	//test install freehost.ua/holweb
//	static String url = "jdbc:h2:file:~/01_hol_2/db-h2/holweb-prodaction-test/lp24protocol";
//	static String applicationFolderPfad = "/home/roman/01_hol_2/hol-sec-2";
	
	//all linux
	static String innerDbFolderPfad = "src/main/webapp/db/";
	static String innerOpenDbFolderPfad = "src/main/webapp/cuwy/db/";

	static String getPrescribeDbJsonName(Integer prescribeId) {
		return "prescribe/prescribe_"+ prescribeId+ ".json";
	}
	static String getPatientDbJsonName(Integer patientId) {
		return "patient/patient_"+ patientId+ ".json";
	}
	static String getDrugDbJsonName(Integer drugId) {
		return "drug/drug_"+ drugId+ ".json";
	}
	static String prescribeOrder1sListJsFileName = "prescribeOrder1sList.json.js";
	static String prescribeOrder1sListOpenJsFileName = "prescribeOrder1sListOpen.json.js";
	static String patient1sListJsFileName = "patient1sList.json.js";
	static String drug1sListJsFileName = "drug1sList.json.js";

}
