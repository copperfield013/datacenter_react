const menuList=[{
		title: '首页',
		key: '/admin/home',
		type: 'home',
	},
	{
		title: 'UI',
		key: '/admin/ui',
		type: 'dropbox',
		children: [{
			title: '按钮',
			key: '/admin/ui/buttons',
		},
		{
			title: '弹框',
			key: '/admin/ui/modals',
			type: 'gold'
		},
		{
			title: 'Loading',
			key: '/admin/ui/loadings',
			type: 'loading'
		},
		{
			title: '通知提醒',
			key: '/admin/ui/notification',
		},
		{
			title: '标签页',
			key: '/admin/ui/tab',
		},
		{
			title: '走马灯',
			key: '/admin/ui/car',
		},
		]
	},
	{
		title: '表单',
		key: '/admin/form',
		type: 'solution',
		children: [{
			title: '登录',
			key: '/admin/form/login',
		},
		{
			title: '注册',
			key: '/admin/form/reg',
		}
		]
	},
	{
		title: '富文本',
		key: '/admin/rich',
		type: 'schedule',
	},
	{
		title: '表格',
		key: '/admin/table/',
		type: 'table',
	},
	{
		title: '动态样式表格',
		key: '/admin/actTable/dd',
		type: 'table',
	},
	{
		title: '图表',
		key: '/admin/echarts',
		type: 'area-chart',
		children: [{
			title: '柱形图',
			key: '/admin/echarts/bar',
			type: 'bar-chart'
		},
		{
			title: '饼图',
			key: '/admin/echarts/pie',
			type: 'pie-chart'
		},
		{
			title: '折线图',
			key: '/admin/echarts/line',
			type: 'line-chart'
		}
		]
	}

	]
export default menuList