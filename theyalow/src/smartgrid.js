const smartgrid = require('smart-grid');

const settings = {
    columns: 12,
    offset: '20px',
    container: {
        maxWidth: '1000px',
        fields: '10px',
        fields_md: '10px'
    },
    breakpoints: {

    }
};

smartgrid('./src/style/partials', settings);