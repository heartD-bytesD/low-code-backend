drop database IF EXISTS `lowcode512`;
create database `lowcode512` character set utf8 collate utf8_bin;
use `lowcode512`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects`  (
  `project_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '项目id',
  `project_data` MEDIUMTEXT NOT NULL COMMENT '项目数据 (最大16M)',
  `project_create_time` datetime(0) NOT NULL COMMENT '项目创建时间',
  `project_last_edit_time` datetime(0) NOT NULL COMMENT '项目最后编辑时间',
  `reserved`  varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '备注' DEFAULT '',
  PRIMARY KEY (`project_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;
create index `project_id` on `projects` (`project_id`);

SET FOREIGN_KEY_CHECKS = 1;
