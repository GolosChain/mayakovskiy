module.exports = post => {
    let metadata;

    try {
        metadata = JSON.parse(post.json_metadata);

        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            metadata = {};
        }
    } catch (error) {
        metadata = {};
    }

    return metadata;
};
