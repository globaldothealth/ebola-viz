import { RootState } from 'redux/store';

export const selectChartData = (state: RootState) => state.chartView.chartData;
