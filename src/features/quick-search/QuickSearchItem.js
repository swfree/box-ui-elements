import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import DatalistItem from 'components/datalist-item';
import { Link } from 'components/link';
import { convertToMs, isToday, isYesterday } from 'utils/datetime';
import IconSmallFolder from '../../icons/folder/IconSmallFolder';
import ItemIcon from '../../icons/item-icon';

import messages from './messages';

import './QuickSearchItem.scss';

const QUERY_SEPARATOR = '<mark>';

const QuickSearchItem = ({ className, closeDropdown, intl, itemData, parentFolderRenderer, ...rest }) => {
    const { formatMessage } = intl;
    const {
        extension,
        iconType,
        id,
        name,
        nameWithMarkedQuery,
        parentName,
        sharedLink,
        type,
        updatedBy,
        updatedDate,
    } = itemData;
    const updatedDateInMs = convertToMs(updatedDate);
    const markedQueryMatches = [];
    nameWithMarkedQuery.split(QUERY_SEPARATOR).forEach((element, index) =>
        index % 2 === 0
            ? markedQueryMatches.push(element)
            : markedQueryMatches.push(
                  <mark key={index} className="search-term">
                      {element}
                  </mark>,
              ),
    );

    let itemIconTitle;
    switch (type) {
        case 'web_link':
            itemIconTitle = <FormattedMessage {...messages.bookmark} />;
            break;
        case 'file':
            itemIconTitle = <FormattedMessage {...messages.file} />;
            break;
        case 'folder':
            if (iconType === 'folder-collab') {
                itemIconTitle = <FormattedMessage {...messages.collaboratedFolder} />;
            } else if (iconType === 'folder-external') {
                itemIconTitle = <FormattedMessage {...messages.externalFolder} />;
            } else {
                itemIconTitle = <FormattedMessage {...messages.personalFolder} />;
            }
            break;
        default:
            itemIconTitle = null;
    }

    let updatedText;
    if (isToday(updatedDateInMs)) {
        updatedText = formatMessage(messages.updatedTextToday, {
            user: updatedBy,
        });
    } else if (isYesterday(updatedDateInMs)) {
        updatedText = formatMessage(messages.updatedTextYesterday, {
            user: updatedBy,
        });
    } else {
        updatedText = formatMessage(messages.updatedText, {
            date: updatedDateInMs,
            user: updatedBy,
        });
    }

    let href;
    let targetProps = {};

    switch (type) {
        case 'folder':
            href = `/folder/${id}`;
            break;
        case 'web_link':
            href = `/web_link/${id}`;
            targetProps = { target: '_blank' };
            break;
        case 'file':
            if (extension === 'boxnote') {
                href = `/notes/${id}`;
                targetProps = { target: '_blank' };
            } else if (sharedLink) {
                href = sharedLink;
            } else {
                href = `/file/${id}`;
            }
            break;
        default:
    }

    const itemName = href ? (
        <Link className="item-name" href={href} onClick={e => e.stopPropagation()} title={name} {...targetProps}>
            {markedQueryMatches}
        </Link>
    ) : (
        <span className="item-name" title={name}>
            {markedQueryMatches}
        </span>
    );

    return (
        <DatalistItem className={classNames('quick-search-item', className)} {...rest}>
            <ItemIcon iconType={iconType} title={itemIconTitle} />

            <span className="item-info">
                {itemName}

                <span className="item-subtext">
                    {(parentName || parentFolderRenderer) && (
                        <React.Fragment>
                            <IconSmallFolder title={<FormattedMessage {...messages.parentFolder} />} />

                            {parentFolderRenderer ? (
                                parentFolderRenderer(itemData, closeDropdown)
                            ) : (
                                <span className="parent-folder">{parentName}</span>
                            )}

                            <span className="separator">·</span>
                        </React.Fragment>
                    )}

                    <span className="txt-ellipsis" title={updatedText}>
                        {updatedText}
                    </span>
                </span>
            </span>
        </DatalistItem>
    );
};

const itemDataShape = {
    extension: PropTypes.string,
    iconType: PropTypes.string,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    nameWithMarkedQuery: PropTypes.string.isRequired,
    parentName: PropTypes.string.isRequired,
    sharedLink: PropTypes.string,
    type: PropTypes.string.isRequired,
    updatedBy: PropTypes.string.isRequired,
    updatedDate: PropTypes.number.isRequired,
};
QuickSearchItem.propTypes = {
    closeDropdown: PropTypes.func,
    className: PropTypes.string,
    intl: intlShape.isRequired,
    itemData: PropTypes.oneOfType([ImmutablePropTypes.recordOf(itemDataShape), PropTypes.shape(itemDataShape)])
        .isRequired,
    parentFolderRenderer: PropTypes.func,
};

export default injectIntl(QuickSearchItem);