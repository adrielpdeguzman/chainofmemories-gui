const JOURNAL_URL = API_URL + "journals/";
const FINDBYVOLUME_URL = JOURNAL_URL + 'search/findByVolume?v={0}';
const GETVOLUMES_URL = JOURNAL_URL + 'search/getVolumesWithStartDate';

var initialVolume = document.getElementById('react').dataset.volume;

class App extends React.Component {

  constructor(props) {
		super(props);
		this.state = {
		  volume: initialVolume,
		  journals: []
		}

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
	  this.setState({
	    volume: e.target.value
	  });
	  updateURL(e.target.value);
	}

	loadJournalsByVolume() {
	  $.ajax({
      url: FINDBYVOLUME_URL.format(this.state.volume),
      success: function(data) {
        this.setState({ journals: data._embedded.journals });
      }.bind(this)
    });
	}

	componentDidMount() {
    this.loadJournalsByVolume();
	}

	componentDidUpdate() {
      this.loadJournalsByVolume();
  	}

  render() {
    return (
      <div>
        <Navigation journals={this.state.journals} volume={this.state.volume} onVolumeChange={this.handleChange}/>
        <JournalList journals={this.state.journals} />
        <SpecialEventsList journals={this.state.journals} />
      </div>
    )
  }

}

class Navigation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      volumes: []
    };

    this.volumeChanged = this.volumeChanged.bind(this);
  }

  componentDidMount() {
    $.ajax({
      url: GETVOLUMES_URL,
      success: function(data) {
        this.setState({ volumes: data });
      }.bind(this)
    });
  }

  volumeChanged(e) {
    this.props.onVolumeChange(e);
  }

  render() {
    let volumes = this.state.volumes.map(function(volume) {
      var isSelected = (initialVolume == volume.volume) ? 'selected' : '';
      return <option value={volume.volume} selected={isSelected}>Volume {volume.volume} {volume.publishDate}</option>
    });

    var previousDay = 0;
    let links = this.props.journals.map(function(link){
      if(link.day == previousDay) {
        return;
      }
      else {
        previousDay = link.day;
        return <li><a href={"#" + link.day + "-" + link.user.firstName}>Day {link.day} | {link.publishDate}</a></li>;
      }
    });

    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <select name="volume" className="form-control" onChange={this.volumeChanged}>
              {volumes}
            </select>
          </div>
          <div className="panel-body">
            <ul className="list-unstyled">
              {links}
              <li><a href="#outline">Special Events Outline</a></li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

}

class JournalList extends React.Component {

  constructor(props) {
		super(props);
	}

  render() {
    var journals = this.props.journals.map(
      journal => <Journal key={journal._links.self.href} journal={journal} />
    );
    return (
      <div>
        {journals}
      </div>
    )
  }

}

class Journal extends React.Component {

  constructor(props) {
		super(props);
	}

  render() {
    let events = parseSpecialEventsToList(this.props.journal.specialEvents)
    return (
      <div>
        <div id={this.props.journal.day + "-" + this.props.journal.user.firstName} className="journal panel panel-default">
          <div className="panel-heading text-uppercase">
            <h2 className="panel-title">
              Vol. {this.props.journal.volume} Day {this.props.journal.day} | {this.props.journal.publishDate}
            </h2>
            <hr/>
            <h3 className="panel-title">
              Posted by: {this.props.journal.user.firstName} {this.props.journal.user.lastName}
            </h3>
          </div>
          <div className="panel-body">
            {this.props.journal.contents}
          </div>
          <div className="panel-footer">
            <ul>
              {events}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

class SpecialEventsList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    var events = this.props.journals.map(
      journal => <SpecialEventsItem journal={journal} />
    );

    return (
      <div>
        <div className="panel panel-default">
          <div id="outline" className="panel-heading text-uppercase">
            <h2 className="panel-title">Special Events Outline</h2>
          </div>
          <div className="panel-body">
            {events}
          </div>
        </div>
      </div>
    )
  }
}

class SpecialEventsItem extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let events = parseSpecialEventsToList(this.props.journal.specialEvents);

    return (
      <div>
        <p><em>Day {this.props.journal.day} | {this.props.journal.publishDate} by:
        {this.props.journal.user.firstName}</em></p>
        <ul>
          {events}
        </ul>
      </div>
    )
  }
}

function parseSpecialEventsToList(specialEvents) {
  var events = specialEvents.split(/\r?\n/).map(
    event => <li>{event}</li>
  );

  return events;
}

ReactDOM.render(
  <App />,
  document.getElementById('react')
);