class Paginator {
    constructor(baseUrl, endpoint, perPage, renderCallback) {
        this.baseUrl = baseUrl;
        this.endpoint = endpoint;
        this.perPage = perPage;
        this.renderCallback = renderCallback;
        this.currentPage = 1;
        this.data = [];
        this.lastPage = 1;
        this.searchTerm = '';
        this.startDate = '';
        this.endDate = '';
        this.init();
    }

    init() {
        this.getData(`${this.baseUrl}${this.endpoint}`);
    }

    getData(url) {
        const config = {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": $("meta[name='csrf-token']").attr("content"),
                "X-Requested-With": "XMLHttpRequest"
            }
        };
        axios.get(url, config)
        .then((res) => {
            this.data = res.data.results;
            this.lastPage = this.data.length > 0 ? Math.ceil(this.data.length / this.perPage) : 1;
            this.render();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }

    render() {
        const startIndex = (this.currentPage - 1) * this.perPage;
        const endIndex = startIndex + this.perPage;
        const paginatedData = this.data.slice(startIndex, endIndex);
        
        this.renderCallback(paginatedData, this.currentPage, this.perPage, this.data.length);

        // Enable or disable the button based on the condition
        $(".paginate").eq(0).prop('disabled', this.currentPage === 1);
        $(".paginate").eq(1).prop('disabled', this.currentPage === this.lastPage);

        $(".paginate").eq(0).data("page", this.currentPage - 1);
        $(".paginate").eq(1).data("page", this.currentPage + 1);

        /*$(".entries").eq(0).text(startIndex + 1);
        $(".entries").eq(1).text(endIndex > this.data.length ? this.data.length : endIndex);
        $(".entries").eq(2).text(this.data.length);*/
    }

    goToPage(page) {
        if (page < 1 || page > this.lastPage) return;
        this.currentPage = page;
        this.render();
    }

    setSearchTerm(term) {
        this.searchTerm = term;
        this.currentPage = 1; // Reset to first page for new search
        this.getData(`${this.baseUrl}${this.endpoint}?searchTerm=${this.searchTerm}`);
    }

    setDateRange(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.currentPage = 1; // Reset to first page for new date range
        this.getData(`${this.baseUrl}${this.endpoint}?startDate=${this.startDate}&endDate=${this.endDate}`);
    }

    getEventsByCategory(endpoint) {
        this.endpoint = endpoint;
        this.currentPage = 1; // Reset to first page for new date range
        this.getData(`${this.baseUrl}${this.endpoint}`);
    }
}