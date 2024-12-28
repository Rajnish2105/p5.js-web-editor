import PropTypes from 'prop-types';
import slugify from 'slugify';
import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ProjectActions from '../actions/project';
import * as IdeActions from '../actions/ide';
import TableDropdown from '../../../components/Dropdown/TableDropdown';
import dates from '../../../utils/formatDate';
import getConfig from '../../../utils/getConfig';

const ROOT_URL = getConfig('API_URL');

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

const SketchListRowBase = ({
  sketch,
  username,
  user,
  changeProjectName,
  cloneProject,
  deleteProject,
  t,
  mobile,
  onAddToCollection
}) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(sketch.name);
  const renameInput = useRef(null);

  const openRename = useCallback(() => {
    setRenameOpen(true);
    setRenameValue(sketch.name);
    renameInput.current.focus();
  }, [sketch.name]);

  const closeRename = () => setRenameOpen(false);

  const updateName = useCallback(() => {
    if (renameValue.trim().length > 0) {
      changeProjectName(sketch.id, renameValue.trim());
    }
  }, [renameValue, sketch.id, changeProjectName]);

  const handleRenameChange = (e) => setRenameValue(e.target.value);

  const handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateName();
      closeRename();
    }
  };

  const handleRenameBlur = () => {
    updateName();
    closeRename();
  };

  const handleSketchDownload = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = `${ROOT_URL}/projects/${sketch.id}/zip`;
    downloadLink.download = `${sketch.name}.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSketchDuplicate = () => cloneProject(sketch);
  const handleSketchDelete = () => {
    if (window.confirm(t('Common.DeleteConfirmation', { name: sketch.name }))) {
      deleteProject(sketch.id);
    }
  };

  const userIsOwner = user.username === username;

  let url = `/${username}/sketches/${sketch.id}`;
  if (username === 'p5') {
    url = `/${username}/sketches/${slugify(sketch.name, '_')}`;
  }

  const name = (
    <>
      <Link to={url}>{renameOpen ? '' : sketch.name}</Link>
      {renameOpen && (
        <input
          value={renameValue}
          onChange={handleRenameChange}
          onKeyDown={handleRenameEnter}
          onBlur={handleRenameBlur}
          onClick={(e) => e.stopPropagation()}
          ref={renameInput}
          maxLength={128}
        />
      )}
    </>
  );

  const items = [
    {
      name: t('SketchList.DropdownRename'),
      onClick: openRename,
      hideIf: !userIsOwner
    },
    {
      name: t('SketchList.DropdownDownload'),
      onClick: handleSketchDownload
    },
    {
      name: t('SketchList.DropdownDuplicate'),
      onClick: handleSketchDuplicate,
      hideIf: !user.authenticated
    },
    {
      name: t('SketchList.DropdownAddToCollection'),
      onClick: onAddToCollection,
      hideIf: !user.authenticated
    },
    {
      name: t('SketchList.DropdownDelete'),
      onClick: handleSketchDelete,
      hideIf: !userIsOwner
    }
  ];

  return (
    <tr className="sketches-table__row">
      <th scope="row">{name}</th>
      <td>{formatDateCell(sketch.createdAt, mobile)}</td>
      <td>{formatDateCell(sketch.updatedAt, mobile)}</td>
      <td className="sketch-list__dropdown-column">
        <TableDropdown
          items={items}
          aria-label={t('SketchList.ToggleLabelARIA')}
        />
      </td>
    </tr>
  );
};

SketchListRowBase.propTypes = {
  sketch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  }).isRequired,
  username: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  deleteProject: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired,
  onAddToCollection: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

SketchListRowBase.defaultProps = {
  mobile: false
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(
    Object.assign({}, ProjectActions, IdeActions), // Binding both ProjectActions and IdeActions
    dispatch
  );
}

export default connect(
  null,
  mapDispatchToPropsSketchListRow
)(SketchListRowBase);
