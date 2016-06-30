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
		  journals: [],
		  datesWithoutEntry: [],
		  volumesWithStartDate: [],
		  journal: []
		};

    this.handleUpdateDialogShow = this.handleUpdateDialogShow.bind(this);
    this.handleJournalCreate = this.handleJournalCreate.bind(this);
    this.handleJournalUpdate = this.handleJournalUpdate.bind(this);
		this.handleVolumeChange = this.handleVolumeChange.bind(this);
	}

  handleUpdateDialogShow(journalToUpdate) {
    this.setState({ journal: journalToUpdate });
  }
	handleVolumeChange(volume) {
	  this.setState({
	    volume: volume
	  },function() {
      this.loadJournalsByVolume();
      updateURL(volume);
    });
	}

	handleJournalCreate(journal) {
	  $.ajax({
      url: JOURNAL_URL,
      dataType: 'json',
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify(journal),
      success: function(data) {
        $('#create-dialog').modal('hide');
        this.loadJournalsByVolume();
        this.loadDatesWithoutEntry();
        this.loadVolumesWithStartDate();
      }.bind(this)
    });
	}

	handleJournalUpdate(journal) {
    $.ajax({
      url: this.state.journal.href,
      dataType: 'json',
      contentType: 'application/json',
      type: 'PATCH',
      data: JSON.stringify(journal),
      success: function(data) {
        $('#update-dialog').modal('hide');
        this.loadJournalsByVolume();
        this.loadDatesWithoutEntry();
        this.loadVolumesWithStartDate();
      }.bind(this)
    });
  }

  loadVolumesWithStartDate() {
    $.ajax({
      url: GETVOLUMES_URL,
      success: function(data) {
        this.setState({ volumesWithStartDate: data });
      }.bind(this)
    });
  }

  loadDatesWithoutEntry()  {
    $.ajax({
      url: GETDATES_URL,
      success: function(data) {
        this.setState({ datesWithoutEntry: data });
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
    this.loadDatesWithoutEntry();
    this.loadVolumesWithStartDate();
	}

  render() {
    return (
      <div>
        <CreateDialog onSubmit={this.handleJournalCreate} datesWithoutEntry={this.state.datesWithoutEntry} />
        <UpdateDialog onSubmit={this.handleJournalUpdate} journal={this.state.journal} />
        <Navigation journals={this.state.journals} onVolumeChange={this.handleVolumeChange} volumesWithStartDate={this.state.volumesWithStartDate} />
        <JournalList journals={this.state.journals} onClickUpdate={this.handleUpdateDialogShow}/>
        <SpecialEventsList journals={this.state.journals} />
      </div>
    )
  }

}

class Navigation extends React.Component {

  constructor(props) {
    super(props);

    this.volumeChanged = this.volumeChanged.bind(this);
  }

  volumeChanged(e) {
    this.props.onVolumeChange(e.target.value);
  }

  render() {
    let volumes = this.props.volumesWithStartDate.map(function(volume) {
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
      journal => <Journal key={journal._links.self.href} journal={journal} onClickUpdate={this.props.onClickUpdate} />
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

		this.handleModalShow = this.handleModalShow.bind(this);
	}

	handleModalShow() {
    this.props.onClickUpdate(this.props.journal);
	}

  render() {
    let events = splitNewLineAndEncloseWithTagWithClass(this.props.journal.specialEvents, "li");
    let contents = splitNewLineAndEncloseWithTagWithClass(this.props.journal.contents, "p");
    return (
      <div>
        <div id={this.props.journal.day + "-" + this.props.journal.user.firstName} className="journal panel panel-default">
          <div className="panel-heading text-uppercase">
            <h2 className="panel-title">
              <button onClick={this.handleModalShow} className="btn btn-default pull-right"
              data-toggle="modal" data-target="#update-dialog"><span className="glyphicon glyphicon-edit"></span></button>
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
        <p><em>Day {this.props.journal.day} | {this.props.journal.publishDate} by: {this.props.journal.user.firstName} {this.props.journal.user.lastName}</em></p>
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
      publishDate: '',
      contents: '',
      specialEvents: ''
    };

    this.handleModalShow = this.handleModalShow.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleContentsChange = this.handleContentsChange.bind(this);
    this.handleSpecialEventsChange = this.handleSpecialEventsChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleModalShow() {
    this.setState({ publishDate: this.props.datesWithoutEntry[0] });
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
    let dates = this.props.datesWithoutEntry.map(
      date => <option value={date}>{date}</option>
    );
    return (
      <div>
        <button type="button" className="btn btn-primary btn-block" data-toggle="modal"
        data-target="#create-dialog" onClick={this.handleModalShow} disabled={this.props.datesWithoutEntry.length == 0}>
        {this.props.datesWithoutEntry == 0 ? "Complete Journal Entries!" : "Create Journal Entry"}</button>
        <div className="modal fade" id="create-dialog" tabindex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title">Create New Journal Entry</h4>
              </div>

              <div className="modal-body">
                <form>
                  <label htmlFor="publishDate">Publish Date</label>
                  <select name="publishDate" className="form-control" onChange={this.handleDateChange}
                   value={this.state.publishDate}>
                    {dates}
                  </select>
                  <div class="form-group">
                    <label htmlFor="contents">Journal Contents</label>
                    <textarea className="form-control" id="contents" name="contents" rows="10"
                     cols="100" required="required" onChange={this.handleContentsChange}
                     value={this.state.contents}></textarea>
                  </div>
                  <div class="form-group">
                    <label htmlFor="specialEvents">Special Events</label>
                    <textarea className="form-control" id="specialEvents" name="specialEvents" rows="4"
                     cols="100" onChange={this.handleSpecialEventsChange}
                     value={this.state.specialEvents}></textarea>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <input type="submit" onClick={this.handleSubmit} className="btn btn-primary"
                disabled={!this.state.contents} value="Create Journal Entry"/>
                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class UpdateDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      contents: '',
      specialEvents: ''
    };

    this.handleContentsChange = this.handleContentsChange.bind(this);
    this.handleSpecialEventsChange = this.handleSpecialEventsChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleContentsChange(e) {
    this.setState({ contents: e.target.value });
  }

  handleSpecialEventsChange(e) {
    this.setState({ specialEvents: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    var journal = this.props.journal;
    var contents = this.state.contents.trim();
    var specialEvents = this.state.specialEvents.trim();
    if(!contents) {
      return;
    }

    journal.contents = contents;
    journal.specialEvents = specialEvents;

    this.props.onSubmit(journal);
    this.setState({ contents: '', specialEvents: '' });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      contents: nextProps.journal.contents,
      specialEvents: nextProps.journal.specialEvents
    });
  }

  render() {
    return (
      <div>
        <div className="modal fade" id="update-dialog" tabindex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title">Update Journal Entry</h4>
              </div>

              <div className="modal-body">
                <form>
                  <div class="form-group">
                    <label htmlFor="contents">Journal Contents</label>
                    <textarea className="form-control" id="contents" name="contents" rows="10"
                     cols="100" required="required" onChange={this.handleContentsChange}
                     value={this.state.contents}></textarea>
                  </div>
                  <div class="form-group">
                    <label htmlFor="specialEvents">Special Events</label>
                    <textarea className="form-control" id="specialEvents" name="specialEvents" rows="4"
                     cols="100" onChange={this.handleSpecialEventsChange}
                     value={this.state.specialEvents}></textarea>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <input type="submit" onClick={this.handleSubmit} className="btn btn-primary"
                disabled={!this.state.contents} value="Update Journal Entry"/>
                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
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