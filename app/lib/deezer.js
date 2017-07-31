'use strict';

const WalkTreeUtils = require('./walktree_utils');

const get = WalkTreeUtils.get;

const M = {};

/* deprecated */
M.musicbrainzToDeezer = function (album) {
  let uri = `//api.deezer.com/search/album?output=jsonp&callback=?&q=album:"${encodeURIComponent(album.title)}"`;
  if (album.artist) {
    uri += `%20artist:"${encodeURIComponent(album.artist)}"`;
  }

  return $.getJSON(uri).then((res) => {
    const deezerAlbum = get(res, 'data', 0);
    if (!deezerAlbum) { return Promise.resolve(); }
    album.deezerAlbumId = deezerAlbum.id;

    return album;
  });
};

/* deprecated */
M.getAlbumId = function (movie) {
  let uri = '//api.deezer.com/search/album?output=jsonp&callback=?';
  uri += `&q=album:"${encodeURIComponent(movie.originalTitle)}"`;

  // if (film.composer && film.composer.label) {
  //     uri += `%20artist:"${encodeURIComponent(film.composer.label)}"`;
  // }

  return $.getJSON(uri).then((res) => {
    const album = get(res, 'data', 0);
    if (!album) { return Promise.resolve(movie); }

    const soundtrack = {
      deezerAlbumId: album.id,
    };

    // TODO: mix with musicbrainz soundtrack, ...
    movie.soundtracks = [soundtrack];
    return movie;
  });
};

/* depreacteed */
M.getTraklist = function (soundtrack) {
  return $.getJSON(`//api.deezer.com/album/${soundtrack.deezerAlbumId}/tracks/?output=jsonp&callback=?`)
  .then((res) => {
    soundtrack.tracks = res.data;
  });
};

/* deprecated */
M.musicbrainz2DeezerAlbum = function (soundtrack) {
  let uri = '//api.deezer.com/search/album?output=jsonp&callback=?';
  uri += `&q=album:"${encodeURIComponent(soundtrack.title)}"`;
  uri += ` label:"${encodeURIComponent(soundtrack.musicLabel)}"`;

  // if (film.composer && film.composer.label) {
  //     uri += `%20artist:"${encodeURIComponent(film.composer.label)}"`;
  // }

  return $.getJSON(uri).then((res) => {
    const album = get(res, 'data', 0);
    if (!album) { return; }

    soundtrack.deezerAlbumId = album.id;
  });
};

M.musicbrainz2DeezerTrack = function (track, album) {
  let params = {
    album: album.title,
    track: track.title,
      // artist: track.artist,
    dur_min: Math.round(track.length / 1000 * 0.9),
    dur_max: Math.round(track.length / 1000 * 1.1),
  };
  params = _.pairs(params).map(kv => `${kv[0]}:"${kv[1]}"`).join(' ');
  params = encodeURIComponent(params);
  return cozy.client.fetchJSON('GET', `/remote/com.deezer.api.track?q=${params}`)
  .then(res => ((typeof res === 'string') ? JSON.parse(res) : res))
  .then((res) => {
    const deezerTrack = res.data[0];
    if (deezerTrack) {
      track.deezerId = deezerTrack.id;
      // track.deezer = deezerTrack;
    } else {
      console.info(`Track: ${track.title} not found`);
    }
  }).catch(res => console.warn(res));
};


M.getTracksId = function (movie) {
  const album = movie.soundtrack;
  const toFind = album.tracks.filter(track => !track.deezerId);
  return Promise.all(toFind.map(track => M.musicbrainz2DeezerTrack(track, album)))
  .then(() => movie);
};

/* deprecated */
M.getSoundtracks = function (movie) {
  return M.musicbrainz2DeezerAlbum(movie.soundtrack)
  .then(() => movie);
};

module.exports = M;
