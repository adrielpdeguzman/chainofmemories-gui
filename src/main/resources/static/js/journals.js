const JOURNAL_URL = API_URL + "journals/";
const FINDBYVOLUME_URL = JOURNAL_URL + 'search/findByVolume?v={0}';
const GETVOLUMES_URL = JOURNAL_URL + 'search/getVolumesWithStartDate';
const GETDATES_URL = JOURNAL_URL + 'search/getDatesWithoutEntry';
const SEARCHVC_URL = JOURNAL_URL + 'search/findByContentsAndVolume?q={0}&v={1}';
const SEARCHC_URL = JOURNAL_URL + 'search/findByContents?q={0}';
const RANDOM_URL = JOURNAL_URL + 'search/findRandom';

var initialVolume = document.getElementById('react').dataset.volume;

class App extends React.Component {

  constructor(props) {
		super(props);
		this.state = {
		  volume: initialVolume,
		  journals: [],
		  datesWithoutEntry: [],
		  volumesWithStartDate: [],
		  journal: [],
		  principal: '',
		  isSearchActive: false
		};

    this.handleUpdateDialogShow = this.handleUpdateDialogShow.bind(this);
    this.handleJournalCreate = this.handleJournalCreate.bind(this);
    this.handleJournalUpdate = this.handleJournalUpdate.bind(this);
		this.handleVolumeChange = this.handleVolumeChange.bind(this);
		this.handleSearchQuery = this.handleSearchQuery.bind(this);
		this.handleSearchStatus = this.handleSearchStatus.bind(this);
		this.handleRandomActivate = this.handleRandomActivate.bind(this);
	}

  handleUpdateDialogShow(journal) {
    this.setState({ journal: journal });
  }

	handleVolumeChange(volume) {
	  this.setState({
	    volume: volume
	  },function() {
      this.loadJournalsByVolume();
      this.loadPrincipal();
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
      url: this.state.journal._links.self.href,
      dataType: 'json',
      contentType: 'application/json',
      type: 'PATCH',
      data: JSON.stringify(journal),
      success: function(data) {
        $('#update-dialog').modal('hide');
        this.setState({ isSearchActive: false });
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

  handleSearchQuery(searchQuery) {
    var url;
    if (searchQuery.v == 0) {
      url = SEARCHC_URL.format(searchQuery.q);
    }
    else {
      url = SEARCHVC_URL.format(searchQuery.q, searchQuery.v);
    }
    $.ajax({
      url: url,
      success: function(data) {
        this.setState({ journals: data._embedded.journals, isSearchActive: true });
      }.bind(this)
    });
  }

  handleRandomActivate() {
      $.ajax({
        url: RANDOM_URL,
        success: function(data) {
          this.setState({ journal: data });
        }.bind(this)
      });
    }

  handleSearchStatus() {
    this.setState({ isSearchActive: !this.state.isSearchActive });
    this.loadJournalsByVolume();
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

	loadPrincipal() {
	  $.ajax({
      url: API_URL + 'me',
      success: function(data) {
        this.setState({ principal: data.name });
      }.bind(this)
    });
	}

	componentDidMount() {
    this.loadJournalsByVolume();
    this.loadPrincipal();
    this.loadDatesWithoutEntry();
    this.loadVolumesWithStartDate();
	}

  render() {
    return (
      <div>
        <div className={this.state.isSearchActive ? 'hidden' : ''}>
          <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#create-dialog"
            disabled={this.state.datesWithoutEntry.length == 0}>
            <span className="glyphicon glyphicon-pencil"></span> Write</button>
          <button className="btn btn-default" onClick={this.handleRandomActivate} data-toggle="modal" data-target="#random-dialog">
            <span className="glyphicon glyphicon-asterisk"></span> Random</button>
        </div>
        <Search volumesWithStartDate={this.state.volumesWithStartDate} onSubmit={this.handleSearchQuery}
         isSearchActive={this.state.isSearchActive} handleSearchStatus={this.handleSearchStatus}/>
        {!this.state.isSearchActive ? <Navigation journals={this.state.journals} onVolumeChange={this.handleVolumeChange}
         volumesWithStartDate={this.state.volumesWithStartDate} />: null}
        <JournalList journals={this.state.journals} onClickUpdate={this.handleUpdateDialogShow} principal={this.state.principal}/>
        {!this.state.isSearchActive ? <SpecialEventsList journals={this.state.journals} /> : null}
        <CreateDialog onSubmit={this.handleJournalCreate} datesWithoutEntry={this.state.datesWithoutEntry} />
        <UpdateDialog onSubmit={this.handleJournalUpdate} journal={this.state.journal} />
        <RandomDialog handleGoToVolume={this.handleVolumeChange} journal={this.state.journal} />
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

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      query: '',
      volume: 0
    };

    this.volumeChanged = this.volumeChanged.bind(this);
    this.queryChanged = this.queryChanged.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleSearchStatus = this.handleSearchStatus.bind(this);
  }

  volumeChanged(e) {
    this.setState({
      volume: e.target.value
    });
  }

  queryChanged(e) {
    this.setState({
      query: e.target.value
    });
  }

  onSubmit(e) {
    e.preventDefault();
    var searchQuery = {};
    searchQuery.q = this.state.query;
    searchQuery.v = this.state.volume;
    this.props.onSubmit(searchQuery);
  }

  handleSearchStatus(e) {
    e.preventDefault();
    this.setState({ query: '', volume: 0 });
    this.props.handleSearchStatus();
  }

  render() {
    let volumes = this.props.volumesWithStartDate.map(function(volume) {
      return <option value={volume.volume}>Volume {volume.volume} {volume.publishDate}</option>
    });

    return (
      <div>
        <form className="form-inline">
          <div className="input-group">
            <span className="input-group-addon"><span className="glyphicon glyphicon-search"></span></span>
            <input type="text" className="form-control" name="query" value={this.state.query} onChange={this.queryChanged} placeholder="Search..."/>
          </div>
          <select name="volume" className="form-control" value={this.state.volume} onChange={this.volumeChanged}>
            <option value="0">All Volumes</option>
            {volumes}
          </select>
          <button className="form-control btn btn-primary" onClick={this.onSubmit}>Search</button>
          {this.props.isSearchActive ? <button className="form-control btn btn-default" onClick={this.handleSearchStatus}>Cancel</button> : null}
        </form>
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
      journal => <Journal key={journal._links.self.href} journal={journal} onClickUpdate={this.props.onClickUpdate} principal={this.props.principal}/>
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
          <div className="panel-heading">
            <h2 className="panel-title text-uppercase">
              {this.props.principal == this.props.journal.user.username ?
              <button onClick={this.handleModalShow} className="btn btn-default pull-right"
              data-toggle="modal" data-target="#update-dialog"><span className="glyphicon glyphicon-edit"></span></button>
              : null
              }
              Day {this.props.journal.day} | {this.props.journal.publishDate}
            </h2>
            <h4 className="panel-title">
              Posted by: {this.props.journal.user.firstName} {this.props.journal.user.lastName}
            </h4>
          </div>
          <div className="panel-body">
            {contents}
          </div>
          <div className={!events ? "hidden" : "panel-footer"}>
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
      <div className={!this.props.journal.specialEvents ? "hidden" : ""}>
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

    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleContentsChange = this.handleContentsChange.bind(this);
    this.handleSpecialEventsChange = this.handleSpecialEventsChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

    journal.publishDate = this.state.publishDate || this.props.datesWithoutEntry[0];
    journal.contents = contents;
    journal.specialEvents = specialEvents;

    this.props.onSubmit(journal);
    this.setState({ publishDate: '', contents: '', specialEvents: '' });
  }

  componentDidMount() {
    $("#create-dialog").on("shown.bs.modal", function(e) {
      $("#create-dialog textarea[name='contents']").focus();
    });
  }

  render() {
    let dates = this.props.datesWithoutEntry.map(
      date => <option value={date}>{date}</option>
    );
    return (
      <div>
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
    var journal = {};
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

  componentDidMount() {
    $("#update-dialog").on("shown.bs.modal", function(e) {
      $("#update-dialog textarea[name='contents']").focus();
    });
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
                <h4 className="modal-title">Day {this.props.journal.day} | {this.props.journal.publishDate}</h4>
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

class RandomDialog extends React.Component {

  constructor(props) {
    super(props);

    this.handleGoToVolume = this.handleGoToVolume.bind(this);
  }

  handleGoToVolume(e) {
    e.preventDefault();
    this.props.handleGoToVolume(this.props.journal.volume);
  }

  componentDidMount() {
    $("#random-dialog").on("shown.bs.modal", function(e) {
      $("#random-dialog button").focus();
    });
  }

  render() {
    let contents = splitNewLineAndEncloseWithTagWithClass(this.props.journal.contents, "p");
    let events = splitNewLineAndEncloseWithTagWithClass(this.props.journal.specialEvents, "li");

    return (
      <div>
        <div className="modal fade" id="random-dialog" tabindex="-1" role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title">
                  Vol. {this.props.journal.volume} Day {this.props.journal.day} | {this.props.journal.publishDate}
                  {!this.props.journal.user ? null : <span> by: {this.props.journal.user.firstName} {this.props.journal.user.lastName}</span> }
                </h4>
              </div>

              <div className="modal-body">
                {contents}
                <hr/>
                <ul>
                  {events}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function splitNewLineAndEncloseWithTagWithClass(input, tag, cssClass = null) {
  if(input == null || input == '') {
    return null;
  }
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
