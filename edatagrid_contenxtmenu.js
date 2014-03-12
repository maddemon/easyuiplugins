$.fn.edatagridByContextMenu = function (data, options, menuId) {
	var dg = $(this);
	var dgOpts = {
		data: data || [],
		onHeaderContextMenu: function (e, field) {
			e.originalEvent.returnValue = false;
			setContextMenu(e);
		},
		onRowContextMenu: function (e, rowIndex, rowData) {
			e.originalEvent.returnValue = false;
			setContextMenu(e);
			return false;
		}
	};

	if (options) {
		dgOpts = $.extend(dgOpts, options);
	}

	dg.edatagrid(dgOpts);

	dg.parent().bind("click", function () {
		dg.edatagrid("saveRow");
	}).bind("contextmenu", function (e) {
		setContextMenu(e);
		return false;
	});

	menuId = menuId || "#main-grid-menu";

	function setContextMenu(e) {
		$(menuId).menu('show', {
			left: e.pageX,
			top: e.pageY
		}).menu({
			onClick: function (item) {
				switch (item.name) {
					case "add":
						dg.edatagrid("addRow");
						break;
					case "remove":
						dg.edatagrid("destroyRow");
						break;
					case "edit":
						dg.edatagrid("editRow");
						break;
					case "save":
						dg.edatagrid("saveRow");
						break;
				}
			}
		});
	}
};
