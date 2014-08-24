$.fn.setUpload = function (uploadUrl, callback, beforeUpload) {
	var file = $(this);
	var form = file.parents("form");
	var formAction = form.attr("action");
	file.change(function () {
		if (beforeUpload && !beforeUpload()) {
			reset();
			return;
		}
		var targetId = "iframe_upload" + Math.random();
		var iframe = $('<iframe width="0" height="0" frameborder="0" id="' + targetId + '" name="' + targetId + '">');
		document.body.appendChild(iframe[0]);
		form.attr({
			target: targetId,
			action: uploadUrl,
			enctype: "multipart/form-data",
			method: "POST"

		});
		form.submit();
		iframe.load(function () {
			var content = $(this).contents().find("body").html();
			try {
				var json = eval("(" + content + ")");
				callback(json);
			} catch (ex) {
				alert("上传出错" + ex);
			}
			iframe.remove();
		});
		reset();
	});

	function reset() {
		file.replaceWith(file.clone());
		form.removeAttr("target");
		form.removeAttr("enctype")
		form.attr("action", formAction);
		$(file).setUpload(uploadUrl, callback, beforeUpload);
	}
};
