author： neptune
time：2019/07/15

####基本规则:
##### code-style： google style

    class： Marker
    function： setMarker
    variable： storeInShenzhen
    global-variable： SHENZHEN_MAP

##### 基本流程：使用 test-environment

     1. fork 本项目至本人项目 P
     2. 使用 git/ Github-Desktop，将 项目P pull 至本地 （每次修改前都需要 pull）
     3. 本地修改，本地测试通过
     4. git/Github-Desktop commit 项目P, push 其至本人项目中
     5. 线上发起 merge： 申请将本人项目 merge 至 主项目的 test-environment branch
     6. approve 后 merge 至测试环境主干，修改结束，反之重新修改


####时间规划:
#####p0: 07/15 - 07/28： 完成所有基础 object 类的开发，并提供相应的测试代码

    * map
        bubble： lynx
        circle： lynx
        geohash： neptune
        label： lynx
        marker： neptune
        polygon： xipeng
        text： xipeng
        
    * graph
        wordcloud: neptune
        circus: snow + neptune
    
    * interaction
        util: lynx + neptune
        converter: xipeng + neptune
    
#####p1: 07/29 - 08/19： 进行所有功能的融合，完成初步功能使用

    * job
        坐标转换： neptune (pointer.js)
        气泡图: lynx (bubble.js)
        多边形: lynx, neptune  (polygon.js + areaselect.js)
        geohash 热力图: xipeng  (geohash.js)
        arg 热力图: lynx  (arcgis.js)
        
    * graph
        词云图: neptune  
        circus: neptune
    
    * strategy
        圈层分析: neptunewang + lynx

#####p2：08/20 - 08/26： 修改 UI，完成相应使用文档

    * TBD
