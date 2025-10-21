const gulp = require('gulp');
const path = require('path');
const fs = require('fs');

const ICON_SRC = 'nodes/CarsXE/carsxeLogo.svg';
const ICON_DEST_DIR = 'dist/nodes/CarsXE';

gulp.task('build:icons', function (done) {
	// ensure destination exists
	if (!fs.existsSync(ICON_SRC)) {
		// nothing to do if user didn't include the icon at the expected path
		console.warn(`Warning: icon not found at ${ICON_SRC}, skipping copy.`);
		return done();
	}
	return gulp.src(ICON_SRC).pipe(gulp.dest(ICON_DEST_DIR));
});
