var $result = document.getElementById("result");

const parseTemplate = ({ template, data }) => {
    const outPutData = { ...template };
    const attributeKeys = Object.keys(outPutData);
    attributeKeys.map((item) => {
        let currentItem = outPutData[item];
        if (typeof currentItem === 'string') {
            currentItem = currentItem.replace(new RegExp('{{', 'g'), '<%-');
            currentItem = currentItem.replace(new RegExp('}}', 'g'), '%>');
            outPutData[item] = ejs.render(currentItem, data);
            /**
             * Bad code; Need a lot of optimization
             */
            if (outPutData[item].match(/object Object/)) {
                currentItem = currentItem.replace('<%-', '<%- JSON.stringify(');
                currentItem = currentItem.replace('%>', ')%>');
                outPutData[item] = ejs.render(currentItem, data);
            }
            if (currentItem.match('JSON.stringify')) {
                outPutData[item] = JSON.parse(outPutData[item]);
            }
        } else if (typeof currentItem === 'object') {
            const out = parse({ template: currentItem, data });
            outPutData[item] = out;
        }

        return null;
    });
    return outPutData;
};
function setResult(result, sucess) {
    if (sucess)
        $result.parentNode.style.background = "#27ae60";
    else
        $result.parentNode.style.background = "#c0392b";
    if (/html/.test(location.search)) {
        $result.innerHTML = result;
    } else {
        $result.textContent = result;
    }
}
(function () {


    function update() {
        var result = null
            , input = editor.getValue()
            ;
        localStorage.setItem('template', input);

        try {
            const variableValue = editorVars.getValue()
            const variables = JSON.parse(variableValue)
            // result = variables
            const templateResp = parseTemplate({ template: { input }, data: variables })
            result = `${JSON.stringify(templateResp)}`;
            console.log(result);
            // result = result.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
            setResult(result, true);
        } catch (e) {
            result = e.stack;
            setResult(result, false);

        }


    }
    const variables = { blockData: {}, blockItem: {} }
    const editorVars = ace.edit("editor-vars");
    editorVars.setValue(
        localStorage.getItem('data-vars') ||
        JSON.stringify(variables, null, 2), -1);

    editorVars.on("change", () => {
        const input = editorVars.getValue();
        localStorage.setItem('data-vars', input);
        update()
    });

    editorVars.setTheme("ace/theme/monokai");
    editorVars.getSession().setMode("ace/mode/json");

    const editor = ace.edit("editor");

    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/ejs");
    editor.on("change", update);
    editor.setValue(
        localStorage.getItem('template') ||
        `Hello world`, -1);
    editor.focus();
}
)();
