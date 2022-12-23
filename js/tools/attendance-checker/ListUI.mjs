class ListUI {
    constructor($parent) {
        this.$parent = $parent;
        this.$listHead = null;
    }

    insertDivider() {
        let $node = document.createElement('DIV');
        $node.className = "divider";
        this.$parent.appendChild($node);
    }

    insertListHeader(text) {
        let $node = document.createElement("DIV");
        $node.className = "attendance-checker__div__leader";
        $node.innerText = text;
        this.$parent.appendChild($node);
    }

    initList() {
        let $node = document.createElement("UL");
        this.$listHead = $node;
        this.$parent.appendChild($node);
    }

    appendListItem(content) {
        let $node = document.createElement("LI");
        $node.innerText = content;
        this.$listHead.appendChild($node);
    }

    clear() {
        while (this.$parent.firstChild) {
            this.$parent.firstChild.remove();
        }
    }
}

export {ListUI}
