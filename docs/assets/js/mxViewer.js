MXGRAPH = {};
MXGRAPH.viewerContainer = null;
MXGRAPH.readerOpts = null;

function createViewer(graphContainer, readerOpts) {
    // Workaround for possible invalid container inside tables
    if (graphContainer == null) {
        return;
    }

    $deferred = $.Deferred();

    // Workaround for ignored alignment in sections and main text for Confluence 5.9
    var macroBlock = graphContainer.parentNode;

    if (macroBlock != null && macroBlock.previousSibling != null &&
            macroBlock.getAttribute('data-macro-name') == 'drawio' &&
            macroBlock.previousSibling.nodeName == 'P' &&
            (macroBlock.previousSibling.childNodes.length == 0 /* normal text */ ||
                    macroBlock.previousSibling.innerHTML == ' ' /* expand macro */)) {
        macroBlock.previousSibling.appendChild(graphContainer);
    }

    try {
        var border = 8;
        function main($deferred) {
            graphContainer.style.minHeight = '';
            var json = readerOpts.req;
            var doc = mxUtils.parseXml(json.xml);
            var config = {
                'toolbar-position': readerOpts.tbstyle,
                nav: true, highlight: '#3b73af', border: border
            };

            if (readerOpts.border)
            {
                graphContainer.style.border = '1px solid #d0d0d0';
            }

            // Forces fit to container and allows scales > 1
            if (readerOpts.width != null && readerOpts.width != 'null')
            {
                config['allow-zoom-in'] = true;
                graphContainer.style.width = readerOpts.width + 'px';
            }

            viewer = new GraphViewer(graphContainer, doc.documentElement, config);
            if (viewer.graph == null || viewer.graph.model == null) {
                return;
            }

            $deferred.resolve(viewer);
        }

        graphContainer.style.minHeight = '200px';
        main($deferred);
    } catch (e) {
        error(e.message);
    }

    return $deferred.promise();
}