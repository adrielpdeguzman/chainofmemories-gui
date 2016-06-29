const JOURNAL_URL = API_URL + "journals/";
const FINDBYVOLUME_URL = JOURNAL_URL + 'search/findByVolume?v={0}';
const GETVOLUMES_URL = JOURNAL_URL + 'search/getVolumesWithStartDate';
const GETDATES_URL = JOURNAL_URL + 'search/getDatesWithoutEntry';

var initialVolume = document.getElementById('react').dataset.volume;

class App extends React.Component {

  constructor(props) {
		super(props);
		this.state = {
		  volume: initialVolume,
		  journals: []
		};

    this.handleCreateJournal = this.handleCreateJournal.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
	  this.setState({
	    volume: e.target.value
	  });
	  updateURL(e.target.value);
	}

	handleCreateJournal(journal) {
	  console.log(JSON.stringify(journal));
	  $.ajax({
      url: JOURNAL_URL,
      dataType: 'json',
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify(journal),
      success: function(data) {
        this.loadJournalsByVolume();
      }.bind(this)
    });
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
        <CreateDialog onSubmit={this.handleCreateJournal} />
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
    let events = splitNewLineAndEncloseWithTagWithClass(this.props.journal.specialEvents, "li");
    let contents = splitNewLineAndEncloseWithTagWithClass(this.props.journal.contents, "p");

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
            {contents}
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
    let events = splitNewLineAndEncloseWithTagWithClass(this.props.journal.specialEvents, "li", "");

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

class CreateDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dates: [],
      publishDate: '',
      contents: '',
      specialEvents: ''
    };

    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleContentsChange = this.handleContentsChange.bind(this);
    this.handleSpecialEventsChange = this.handleSpecialEventsChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    $.ajax({
      url: GETDATES_URL,
      success: function(data) {
        this.setState({ dates: data, publishDate: data[0] });
      }.bind(this)
    });
  }

  handleDateChange(e) {
    this.setState({ publishDate: e.target.value });
  }

  handleContentsChange(e) {
    this.setState({ contents: e.target.value });
  }

  handleSpecialEventsChange(e) {
    this.setState({ specialEvents: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    var journal = {};
    var contents = this.state.contents.trim();
    var specialEvents = this.state.specialEvents.trim();
    if(!contents) {
      return;
    }

    journal.publishDate = this.state.publishDate;
    journal.contents = contents;
    journal.specialEvents = specialEvents;

    this.props.onSubmit(journal);
    this.setState({ publishDate: '', contents: '', specialEvents: '' });
  }

  render() {
    let dates = this.state.dates.map(
      date => <option value={date}>{date}</option>
    );
    return (
      <div>
        <form>
          <select name="publishDate" className="form-control" onChange={this.handleDateChange}>
            {dates}
          </select>
          <div class="form-group">
            <label for="contents">
              <p>Journal Contents</p>
              <textarea class="form-control" id="contents" name="contents" rows="12" cols="50"
                required="required" onChange={this.handleContentsChange}></textarea>
            </label>
          </div>
          <div class="form-group">
            <label for="specialEvents">
              <p>Special Events</p>
              <textarea class="form-control" id="specialEvents" name="specialEvents" rows="4"
              cols="50" onChange={this.handleSpecialEventsChange}></textarea>
            </label>
          </div>

          <button onClick={this.handleSubmit} className="form-control btn btn-primary btn-block">
            Create Journal Entry
          </button>
        </form>
      </div>
    );
  }
}

function splitNewLineAndEncloseWithTagWithClass(input, tag, cssClass = null) {
  var input = input.split(/\r?\n/);

  switch(tag) {
    case "li":
      var lines = input.map(
        line => <li className={cssClass}>{line}</li>
      );
      break;
    case "div":
      var lines = input.map(
        line => <div className={cssClass}>{line}</div>
      );
      break;
    case "p":
      var lines = input.map(
        line => <p className={cssClass}>{line}</p>
      );
      break;
    case "span":
      var lines = input.map(
        line => <span className={cssClass}>{line}</span>
      );
      break;
    default:
      var lines = input.map(
        line => {line}
      );
  }
  return lines;
}

ReactDOM.render(
  <App />,
  document.getElementById('react')
);