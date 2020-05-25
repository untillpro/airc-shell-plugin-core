import isProd from 'is-prod';

export default (...args) => {
    if (isProd.isDevelopment()) 
        console.log(...args);
};