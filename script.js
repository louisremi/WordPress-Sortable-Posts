(function($) {

var initialCursor,
	currentCursor,
	initialPosition,
	line,
	$line,
	$postTitle,
	$theList,
	$placeholder,
	$inlineStyle,
	tableBg,
	postParent;

jQuery(function() {
	$theList = $('#the-list');
	$placeholder = $('<tr class="sp-placeholder"></tr>');
	$inlineStyle = $('<style></style>').appendTo( document.body );
	tableBg = $theList.parent().css('backgroundColor');
});

$(document).on('mousedown', 'td.column-sortable', function( e ) {
	line = e.currentTarget.parentNode;

	initialCursor = {
		X: e.pageX,
		Y: e.pageY
	};

	return false;
});

// here we initiaite the mouse drag
$(document).on('mousemove', function( e ) {
	if ( !$line ) {
		if ( initialCursor ) {
			var dCursorX = e.pageX - initialCursor.X,
				dCursorY = e.pageY - initialCursor.Y;

			// dragging threshold
			if ( Math.sqrt( dCursorX * dCursorX + dCursorY * dCursorY ) > 5 ) {
				$line = $( line );
				$postTitle = $line.find('td.post-title');
				initialPosition = $line.position();
				postParent = $line.find('div.post_parent').text();

				// hide all lines that don't have the same parent
				$inlineStyle.html(
					( $('#post-' + postParent).length ?	'#post-' + postParent + ' ~ ' : '' ) +
					'tr.hentry { display: none; }\n' +
					'tr.post-parent-' + postParent + ' { display: table-row !important; }\n'
				);

				// prevent .row-actions to become visible
				// and decorate the dragged-line
				$theList.add( $line )
					.addClass('sp-dragging');

				// insert placeholder
				var lineHeight;
				$placeholder.css({
					height: lineHeight = $line.height()
				}).insertAfter( $line );

				// preserve the dimensions and position of this line
				$line.css({
					position: 'absolute',
					top: 0,
					left: 0,
					height: lineHeight,
					backgroundColor: $line.css('backgroundColor') == 'transparent' ? tableBg : ''
				});
			}
		}
		return;
	}

	currentCursor = {
		pageX: e.pageX,
		pageY: e.pageY,
		clientX: e.clientX,
		clientY: e.clientY
	};

	return false;
});

// here we check where the cursor is, scroll if necessary, and move the dragged line
setInterval(function() {
	if ( !$line ) {
		return;
	}

	var scrollBy = 0;

	if ( currentCursor.clientY < 20 ) {
		scrollBy = -10;

	} else if ( window.innerHeight - currentCursor.clientY < 20 ) {
		scrollBy = 10;
	}

	if ( scrollBy ) {
		window.scrollBy( 0, scrollBy );
		currentCursor.pageY += scrollBy;
	}

	// this is how moving the line would work in IE8
	/*$line.css({
		top: initialPosition.top + e.pageY - initialCursor.Y,
		left: initialPosition.left + e.pageX - initialCursor.X
	});*/

	$line.css({
		transform: 'translate(' +
			( initialPosition.left + currentCursor.pageX - initialCursor.X ) + 'px,' +
			( initialPosition.top + currentCursor.pageY - initialCursor.Y ) +
		'px)'
	});

}, 33);

// here we check where the cursor is and move the placeholder
setInterval(function() {
	if ( !$line ) {
		return;
	}

	// move the line away from the cursor
	$line.css({
		transform: 'translate(' +
			( initialPosition.left + currentCursor.pageX - initialCursor.X + 50 ) + 'px,' +
			( initialPosition.top + currentCursor.pageY - initialCursor.Y ) +
		'px)'
	});

	var $hoverLine = $( document.elementFromPoint( currentCursor.clientX, currentCursor.clientY ) ).closest('tr.hentry');

	if ( $hoverLine.length && $hoverLine.find('div.post_parent').text() === postParent ) {
		var boundingBox = $hoverLine[0].getBoundingClientRect();

		if ( currentCursor.clientY - boundingBox.top < ( boundingBox.bottom - boundingBox.top ) / 2 && $hoverLine.prev()[0] != $placeholder[0] ) {
			$placeholder.insertBefore( $hoverLine );
		}
		if ( currentCursor.clientY - boundingBox.top > ( boundingBox.bottom - boundingBox.top ) / 2 && $hoverLine.next()[0] != $placeholder[0] ) {
			$placeholder.insertAfter( $hoverLine );
		}
	}

	// move the line back under the cursor
	$line.css({
		transform: 'translate(' +
			( initialPosition.left + currentCursor.pageX - initialCursor.X ) + 'px,' +
			( initialPosition.top + currentCursor.pageY - initialCursor.Y ) +
		'px)'
	});
}, 200);

$(document).on('mouseup', function() {
	currentCursor = initialCursor = undefined;

	if ( !$line ) {
		return;
	}

	var firstOrderValue = +$theList.find('tr.post-parent-' + postParent + ':first-of-type').find('div.menu_order').html(),
		newOrder = {},
		children = [],
		$current = $line.next('.post-parent-' + $line[0].id.split('-')[1]),
		$next = $placeholder.next('tr'),
		$prev = $placeholder.prev('tr'),
		prevId = $prev.length && $prev[0].id.split('-')[1];

	// collect all children
	while ( $current.is(':not(.post-parent-' + postParent + ')') ) {
		children.push( $current );
		$current = $current.next();
	}

	// insert the line after the placeholder, but not in the middle of a line and its children
	!$next.length ||
	!$prev.length ||
	$next.find('div.post_parent').text() !== prevId ||
	prevId === postParent ?
		$line.insertBefore( $placeholder ) :
		// make sure we're not trying to insert the line before itself
		( $current = $placeholder.nextAll('.post-parent-' + postParent + ':first') )[0] != $line[0] &&
		// use appendTo if the end of the list was reached
		$current.length ? $line.insertBefore( $current ) : $line.appendTo( $line.parent() );

	// move children too
	$( children ).insertAfter( $line );

	// restore the dimesions and position of this line
	$line.css({
		position: '',
		top: '',
		left: '',
		//width: '',
		height: '',
		backgroundColor: '',
		transform: ''
	});

	// allow .row-actions to become visible
	// and remove outline from the dragged line
	$theList.add( $line )
		.removeClass('sp-dragging');

	$inlineStyle.html('');

	$placeholder.remove();

	$line = undefined;

	// reorder all the things
	$theList.find('tr.post-parent-' + postParent).each(function( i ) {
		$(this).find('div.menu_order').html( firstOrderValue + i );

		newOrder[ this.id.split('-')[1] ] = firstOrderValue + i;
	});

	// post new order
	jQuery.post(ajaxurl, {
		action: 'posts_order',
		new_order: newOrder

	}, function( response ) {
		console.log( response );
	});
});

})(jQuery);