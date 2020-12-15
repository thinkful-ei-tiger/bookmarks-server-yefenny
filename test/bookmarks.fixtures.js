function makeBookmarks() {
  return [
    {
      id: 1,
      title: 'Google 1',
      url: 'https://www.google.com',
      description: 'A search Engine',
      rating: 3
    },
    {
      id: 2,
      title: 'Yahoo ',
      url: 'https://www.yahoo.com',
      description: 'Another search Engine',
      rating: 2
    },
    {
      id: 3,
      title: 'Facebook',
      url: 'https://www.facebook.com',
      description: 'A Social media',
      rating: 3
    }
  ];
}

module.exports = {
  makeBookmarks
};
