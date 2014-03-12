$.fn.getConvertedData = function () {
	var self = this;
	var fieldTypes = {};
	var columnRows = this.datagrid("options").columns;
	$.each(columnRows, function (i, columns) {
		$.each(columns, function (j, column) {
			if (!column.field) return;
			fieldTypes[column.field] = "string";
			var editor = column.editor;
			if (editor && editor.type == "numberbox") {
				if (editor.options && editor.options.precision > 0) {
					fieldTypes[column.field] = "float";
				} else {
					fieldTypes[column.field] = "int";
				}
			}
		});
	});
	var rows = this.datagrid("getData").originalRows;
	$.each(rows, function (i, row) {
		for (var k in row) {
			switch (fieldTypes[k]) {
				case "int":
					row[k] = parseInt(row[k] || 0);
					break;
				case "float":
					row[k] = parseFloat(row[k] || 0);
					break;
			}
		}
	});

	return rows;
}
