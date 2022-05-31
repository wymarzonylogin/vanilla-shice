class Table {
    constructor(rootElement, options, data) {
        let key = 0;
        this.data = data.map((i) => {
            i['key'] = key;
            key++;
            return i;
        });

        this.rootElement = rootElement;
        this.columns = options.columns;
        this.columnKeys = Object.keys(this.columns);
        this.paginator = {
            pageSize: options.paginator.pageSize,
            pagesCount: Math.ceil(data.length / options.paginator.pageSize),
            pageIndex: 1
        }
        this.order = {
            column: null,
            direction: 1
        }
        this.rowClickFn = options.rowClickFn;

        this.rootElement.addEventListener('click', this.handleClick.bind(this))
    }

    handleClick(e) {
        e.preventDefault();
        if (e.target.classList.contains('page-next')) {
            this.paginator.pageIndex++;
            this.render();
        } else if (e.target.classList.contains('page-prev')) {
            this.paginator.pageIndex--;
            this.render();
        } else if (e.target.classList.contains('page-first')) {
            this.paginator.pageIndex = 1;
            this.render();
        } else if (e.target.classList.contains('page-last')) {
            this.paginator.pageIndex = this.paginator.pagesCount;
            this.render();
        } else if (e.target.tagName.toUpperCase() === 'TH') {
            const key = e.target.getAttribute('data-key');
            if (this.order.column === key) {
                this.order.direction *= -1;
            } else {
                this.order.column = key;
                this.order.direction = 1;
            }
            this.render();
        } else if (e.target.tagName.toUpperCase() === 'TD') {
            this.rowClickFn(this.data[parseInt(e.target.parentElement.getAttribute('data-key'))]);
        }
    }

    render() {
        const startIndex = (this.paginator.pageIndex - 1) * this.paginator.pageSize;
        const pagedData = [...this.data].sort((x, y) => {
            if (!this.order.column) {
                return 0;
            } else {
                let a = x;
                let b = y;
                if (this.order.direction === -1) {
                    a = y;
                    b = x;
                }
                if (this.columns[this.order.column].type === 'number') {
                    return a[this.order.column] - b[this.order.column];
                } if (this.columns[this.order.column].type === 'string') {
                    return a[this.order.column].localeCompare(b[this.order.column]);
                } else {
                    return 0;
                }
            }
        }).slice(startIndex, startIndex + this.paginator.pageSize);

        let content = '<table class="vanilla-shice"><thead>' + this.headHTML() + '</thead><tbody>' + this.bodyHTML(pagedData) + '</tbdody></table>';
        if (this.paginator.pagesCount > 1) {
            content += this.paginatorHTML(this.paginator);
        }
        
        this.rootElement.innerHTML = content;
    }

    paginatorHTML(paginator) {
        let res = '<p>Page ' + paginator.pageIndex.toString() + ' / ' + paginator.pagesCount.toString() + '</p>';
        if (paginator.pageIndex > 1) {
            res += '<a class="page-first" href="#">First</a> <a class="page-prev" href="#">Previous</a> ';
        } else {
            res += '<span>First</span> <span>Previous</span> ';
        }

        if (paginator.pageIndex < paginator.pagesCount) {
            res += '<a class="page-next" href="#">Next</a> <a class="page-last" href="#">Last</a>';
        } else {
            res += '<span>Next</span> <span>Last</span> ';
        }

        return '<div class="paginator">' + res + '</div>';
    }

    headHTML() {
        return '<tr>' + this.columnKeys.map((col) => {
            let className = '';
            if (this.order.column === col) {
                if (this.order.direction === 1) {
                    className = 'underline';
                } else {
                    className = 'overline';
                }
            }
            return '<th class="' + className + '" data-key="' + col + '">' + this.columns[col].label + '</th>';
        }).join('') + '</tr>';
    }

    bodyHTML(data) {
        return data.map((row) => {
            return this.rowHTML(row);
        }).join('');
    }

    rowHTML(row) {
        return '<tr data-key="' + row.key.toString() + '">' + this.columnKeys.map((columnKey) => {
            return this.cellHTML(row[columnKey]);
        }).join('') + '</tr>';
    }

    cellHTML(cell) {
        if (cell === null) {
            cell = '';
        }
        return '<td>' + cell.toString() + '</td>';
    }
}