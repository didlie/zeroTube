import React, { Component } from 'react'
import { Link } from 'react-router'
import moment from 'moment'

class VideoCard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      poster: 'public/img/no-preview.jpg',
      peers: 0
    }
  }

  componentDidMount () {
    let torrent = this.props.webtorrent.client.get(this.props.video.video_id)
    if (!torrent) {
      this.props.webtorrent.client.add(this.props.video.magnet, (torrent) => {
        this.setState({peers: torrent.numPeers})
        torrent.on('wire', () => {
          this.setState({peers: torrent.numPeers})
        })
        let file = torrent.files[0]
        file.deselect() // Stop downloading the file but still give information on peers
        /* torrent.on('done', () => {
          console.log('Done !')
          this.createPosterVideo('#' + torrent.infoHash + ' > video')
        })
        torrent.files[0].appendTo('#' + torrent.infoHash) */
      })
    } else {
      this.setState({peers: torrent.numPeers})
      torrent.on('wire', () => {
        this.setState({peers: torrent.numPeers})
      })
    }
  }

  createPosterVideo (video, format) {
    if (typeof video === 'string') {
      video = document.querySelector(video)
    }

    video.volume = 0

    if (video == null || video.nodeName !== 'VIDEO') {
      throw new Error('First argument must be a <video> element or selector')
    }

    if (format == null) {
      format = 'png'
    }

    if (format !== 'png' && format !== 'jpg' && format !== 'webp') {
      throw new Error('Second argument must be one of "png", "jpg", or "webp"')
    }

    let canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    canvas.getContext('2d').drawImage(video, 0, 0)

    let dataUri = canvas.toDataURL('image/' + format)
    let data = dataUri.split(',')[1]

    // unload video element
    video.pause()
    video.src = ''
    video.load()

    this.setState({poster: 'data:image/png;base64,' + data})
  }

  render () {
    let style = {
      maxWidth: '20rem'
    }
    let none = {
      display: 'none'
    }
    let wrapWord = {
      wordWrap: 'break-word'
    }
    return (
      <div style={style} className="card">
        <img className="card-img-top img-fluid" src={this.state.poster} alt="Card image cap" />
        <div className="card-block">
          <h5 className="card-title">{this.props.video.title}</h5>
          <small className="text-muted">
            Added {moment(this.props.video.date_added).fromNow()} by <a href="#">{this.props.video.user_name}</a>
          </small>
          <br />
          <br />
          <p style={wrapWord} className="card-text text-subtle">{this.props.video.description}</p>
          <Link to={'/watch/' + this.props.video.video_id} type="button" className={'btn btn-outline-primary pull-right ' + (this.state.peers === 0 ? 'disabled' : null)}>Watch it ({this.state.peers} peers)</Link>
        </div>
        <div style={none} id={this.props.video.video_id}></div>
      </div>
    )
  }
};

export default VideoCard
