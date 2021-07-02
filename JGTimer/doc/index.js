(function(data){if(window._$putV3SmartclientWidgetDoc){window._$putV3SmartclientWidgetDoc(data);}})({"class:JGTimer":{"seeAlso":[],"exampleConfig":null,"type":"class","staticMethods":[],"inheritsFrom":"JGBaseWidget","classMethods":[],"classAttrs":[],"attrs":[],"deprecated":null,"treeLocation":["V平台扩展"],"implementsInterfaces":["IWindowAop"],"description":"<p>V平台定时器控件</p>","methods":["method:JGTimer.startTimer","method:JGTimer.stopTimer","method:JGTimer.getStartup","method:JGTimer.setStartup"],"name":"JGTimer","ref":"class:JGTimer"},"method:JGTimer.startTimer":{"seeAlso":[],"type":"method","definingClass":"class:JGTimer","groups":[],"returns":{"type":"","description":""},"deprecated":null,"params":[],"description":"<p>采用闭包封装js原生的间隔方法构造启动方法</p>","flags":"","name":"startTimer","ref":"method:JGTimer.startTimer"},"method:JGTimer.stopTimer":{"seeAlso":[],"type":"method","definingClass":"class:JGTimer","groups":[],"returns":{"type":"","description":""},"deprecated":null,"params":[],"description":"<p>停止定时器</p>","flags":"","name":"stopTimer","ref":"method:JGTimer.stopTimer"},"method:JGTimer.getStartup":{"seeAlso":[],"type":"method","definingClass":"class:JGTimer","groups":[],"returns":{"type":"Boolean","description":""},"deprecated":null,"params":[],"description":"<p>初始化时，该状态为undefined，此时，定时器的状态以开发系统中设置的为准。<br>默认规则，会对该属性进行判断，如果需要启动，则会进行启动。<br>运行期，如果定时器启动过，则以真实的状态为准。</p>","flags":"","name":"getStartup","ref":"method:JGTimer.getStartup"},"method:JGTimer.setStartup":{"seeAlso":[],"type":"method","definingClass":"class:JGTimer","groups":[],"returns":{"type":"","description":""},"deprecated":null,"params":[{"defaultValue":null,"optional":false,"type":"Boolean","description":"<p>启动状态</p>","name":"Startup"}],"description":"<p>设置启动状态</p>","flags":"","name":"setStartup","ref":"method:JGTimer.setStartup"}});