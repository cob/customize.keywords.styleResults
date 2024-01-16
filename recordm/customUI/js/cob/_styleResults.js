cob.custom.customize.push(function (core, utils, ui) {
    const toES = (name) => name.toLowerCase().replace(/ /g, '_')

    core.customizeColumn("*","*",function(node, esDoc, fieldInfo){
        // Check $styleResultColumn
        const matchColumnRegex = /\$styleResultColumn\(([^)]*)\)/
        let styleColField = matchColumnRegex.exec(fieldInfo.fieldDefDescription)
        if(styleColField) {
            const fieldValue = esDoc[toES(fieldInfo.name)] && esDoc[toES(fieldInfo.name)][0];
            const relevantMapping = styleColField[1].split(",")

            for(let mapping of relevantMapping) {
                let [styleValue, styleClass] = mapping.split(":")
                if( styleValue.trim() == fieldValue
                    || styleValue.trim() == "" && fieldValue == undefined
                    || styleValue.trim() == "*"
                ) {
                    node.classList.add(styleClass.trim())
                    node.classList.add("cobStyleColummn")
                    break
                }
            }
        }
    }),

        core.customizeAllColumns("*",function(node, esDoc, fieldInfo){
            // Finds $styleResultRows -> ATTENTION: only first occurrence, subsequent $styleResultRows will be ignore
            // TODO: remove dependency of $styleResultsRow HAVING TO HAVE ALSO $instanceDescription
            const matchRowsRegex = /\$styleResultRows\(([^)]*)\)/
            let firstStyleResultsField = esDoc._definitionInfo.instanceDescription.find( field => matchRowsRegex.exec(field.description))
            if(firstStyleResultsField) {
                const fieldValue = esDoc[toES(firstStyleResultsField.name)] && esDoc[toES(firstStyleResultsField.name)][0];
                const relevantMapping = matchRowsRegex.exec(firstStyleResultsField.description)[1].split(",")

                for(let mapping of relevantMapping) {
                    let [styleValue, styleClass] = mapping.split(":")
                    if( styleValue.trim() == fieldValue
                        || styleValue.trim() == "" && fieldValue == undefined
                        || styleValue.trim() == "*"
                    ) {
                        node.classList.add(styleClass.trim())
                        break
                    }
                }
            }
        })

    core.customizeAllInstances((instance, presenter) => {
        const matcher = /[$]style\[(.*styleField.*)?\]/;
        const styleFields = presenter.findFieldPs((fp) => matcher.exec( fp.field.fieldDefinition.description ) );
        styleFields.forEach((fp) => {

            const matchColumnRegex = /\$styleResultColumn\(([^)]*)\)/
            let styleColField = matchColumnRegex.exec(fp.field.fieldDefinition.description)
            if(styleColField) {

                const updateStyle = function() {
                    const fieldValue = fp.getValue();
                    const relevantMapping = styleColField[1].split(",")
                    const node = fp.content()[0];

                    // Choose node to affect
                    let valueNode = node.querySelector(".radiogroup")
                    if(!valueNode) {
                        valueNode = node.querySelector("td label")
                    }

                    // Clean previous class
                    for(let mapping of relevantMapping) {
                        let [styleValue, styleClass] = mapping.split(":")
                        valueNode.classList.remove(styleClass.trim())
                    }

                    // Set new class
                    for(let mapping of relevantMapping) {
                        let [styleValue, styleClass] = mapping.split(":")
                        if( styleValue.trim() == fieldValue
                            || styleValue.trim() == "" && fieldValue == undefined
                            || styleValue.trim() == "*"
                        ) {
                            valueNode.classList.add(styleClass.trim())
                            break
                        }
                    }
                }

                updateStyle();
                presenter.onFieldChange(fp.field.fieldDefinition.name, updateStyle);
            }
        });
    });

})