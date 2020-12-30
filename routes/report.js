var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');

function renderReportContent(content) {
    return content.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

function buildReportLayout(report) {
    return {
        layout: 'report',
        report_raw: report
    };
}

function buildErrorLayout(message) {
    return {
        message: message,
        error: {
            status: "",
            stack: ""
        }
    };
}

router.get('/:sid', async function(req, res, next) {
    let sid = req.params.sid;
    let uid = req.session.uid;
    let viewPrivilege = await dblink.permission.sourceCodeVeiwPrivilege(uid, sid);

    if (!viewPrivilege) {
        res.render('layout', {
            layout: 'report',
            report_raw: 'You neet to pass this problem to view the report.'
        });

        return;
    }

    dblink.report.getBySidPromise(sid).then(reportRow => {
        let report = reportRow[0].content
        report = renderReportContent(report);

        res.render('layout', buildReportLayout(report));
    }).catch(error => {
        res.render('error', buildErrorLayout(error));
    });

});

module.exports = router;