const extractMetadata = require('./MetadataParser');

module.exports = (post, criteria, criteriaValue) => {
    switch (criteria) {
        case 'character':
            return post.body.length * criteriaValue;

        case 'image':
            const metadata = extractMetadata(post);
            const images = metadata.image || [];
            return images.length * criteriaValue;

        default:
            return 0;
    }
};
