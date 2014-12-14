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
			"alter table PATIENT1 add column if not exists patient_savedts timestamp default now() not null"
			,"alter table PATIENT1 add column if not exists patient_checked boolean default true"
		]
	},{
		"dbVersionId" : 4,
		"sqls" : [
			"select ' alter table PATIENT1 drop CONSTRAINT '||constraint_name as sql_update from information_schema.constraints where table_name ='PATIENT1' and column_list = 'PATIENT_NAME'"
		]
	},{
		"dbVersionId" : 5,
		"sqls" : [
			"alter table drug1 add column if not exists drug_savedts timestamp default now() not null"
		]
	},{
		"dbVersionId" : 7,
		"sqls" : [
			"drop table if exists  DRUG_WEB1 "
			,"CREATE TABLE if not exists DRUG_WEB1 (DRUG_WEB_ID INT(10) primary key, DRUG_WEB_NAME VARCHAR(50) unique NOT NULL, DRUG_WEB_ARCHIVE BOOLEAN NOT NULL, DRUG_WEB_SAVEDTS TIMESTAMP NOT NULL)"
		]
	},{
		"dbVersionId" : 8,
		"sqls" : [
			"alter table drug1 add column if not exists checked_web_savedts timestamp default dateadd('year',-1,now()) not null"
		]
	},{
		"dbVersionId" : 9,
		"sqls" : [
			"create table if not exists tag1 (tag_name varchar(40)  not null, tag_drug_id int , tag_prescribe_id int , tag_pid int , tag_id int default (NEXT VALUE FOR dbid), unique (tag_name), primary key (tag_id), foreign key (tag_pid) references tag1(tag_id), foreign key (tag_drug_id) references drug1(drug_id), foreign key (tag_prescribe_id) references prescribe1(prescribe_id))"
		]
	},{
		"dbVersionId" : 10,
		"sqls" : [
			"alter table tag1 alter column tag_name set null"
		]
	}
	]
}
