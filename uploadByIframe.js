$.fn.upload = function (fileId, uploadUrl, callback, beforeUpload) {
	var form = this;
	$("#" + fileId).change(function () {
		if (beforeUpload && !beforeUpload()) {
			$(this).val('');
			return;
		}
		var targetId = "iframe_upload" + Math.random();
		var iframe = $('<iframe width="0" height="0" frameborder="0" id="' + targetId + '" name="' + targetId + '">');
		document.body.appendChild(iframe[0]);
		form.attr({
			target: targetId,
			action: uploadUrl,
			enctype: "multipart/form-data",
			encoding: "multipart/form-data",
			method: "POST"

		});
		form.submit();
		iframe.load(function () {
			var content = $(this).contents().find("body").html();
			callback(content);
			iframe.remove();
		});
		$(this).val('');
	});
};
