import "./JGIGroupPanel";
import "./JGHGroupPanel";
import "./JGTableGroupPanel";
import "./JGVGroupPanel";

isc.ClassFactory.defineClass("JGGroupPanel");


isc.JGGroupPanel = {

	create: function(Properties){
		var widget;
		switch(Properties.ContentAlignment){
			case 'Vertical':
				widget = isc.JGVGroupPanel.create(Properties);
				break;
			case 'Horizontal':
				widget = isc.JGHGroupPanel.create(Properties);
				break;
			case 'Table':
				widget = isc.JGTableGroupPanel.create(Properties);
				break;
			default:
				throw new Error('未识别编组控件内容排列信息['+Properties.ContentAlignment+']，请检查！');
		}
		return widget;
	}

};