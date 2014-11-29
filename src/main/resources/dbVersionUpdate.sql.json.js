{
	"dbVersionUpdateList" : [ {
		"dbVersionId" : 0,
		"sqls" : [
"CREATE TABLE if not exists dbversion (dbversion_ID INT(10) NOT NULL, dbversion_date timestamp default now(), primary key (dbversion_id))"
,"CREATE SEQUENCE if not exists  dbid" 
		],
"dbVersionDate" : 1416847481200
	},{
		"dbVersionId" : 1,
		"sqls" : [
			"INSERT INTO DBVERSION (DBVERSION_ID) VALUES (0)"
		]
	},{
		"dbVersionId" : 3,
		"sqls" : [
			"alter table PATIENT1 add column if not exists patient_savedts timestamp  not null"
			,"alter table PATIENT1 add column if not exists patient_checked boolean default true"
		]
	}
	]
}
